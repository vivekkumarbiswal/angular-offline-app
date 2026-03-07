# Angular Offline-First PWA (Form Sync Example)

This project demonstrates an **offline-first Angular application** with the following capabilities:

* Submit form data to a backend API when **online**
* Store form data in **IndexedDB** when **offline**
* Automatically **sync offline data** when internet returns
* Cache the **application shell and API responses** using a PWA Service Worker
* Load the **entire application offline**

---

# Tech Stack

* Angular
* Reactive Forms
* RxJS
* ngx-indexed-db
* json-server
* Angular Service Worker (PWA)

---
# Architecture Diagram

The following diagram shows how the different layers of the application interact.

                    +--------------------+
                    |    Angular UI      |
                    |  (Reactive Form)   |
                    +---------+----------+
                              |
                              |
                              v
                    +--------------------+
                    |    Sync Service    |
                    | (Offline-first     |
                    |   controller)      |
                    +---------+----------+
                              |
               +--------------+---------------+
               |                              |
               v                              v

      +--------------------+        +--------------------+
      |     Api Service     |        |  IndexedDB Service |
      |  HTTP Requests      |        | Offline Storage    |
      +----------+----------+        +----------+---------+
                 |                              |
                 v                              v

        +---------------+             +-------------------+
        |   json-server |             |     IndexedDB     |
        |  REST API     |             |  offlineUsers     |
        +---------------+             +-------------------+
# Offline Sync Flow
User submits form
        |
        v
SyncService.submitUser()
        |
        |------ Internet Available ------|
        |                                |
        v                                v
POST /users                        Save in IndexedDB
(json-server)                     (offline queue)
        |
        v
UI refresh


# Internet Recovery Flow
Internet Connection Restored
        |
        v
window "online" event
        |
        v
syncOfflineUsers()
        |
        v
Read IndexedDB records
        |
        v
POST records to server
        |
        v
Clear IndexedDB
        |
        v
Refresh UI

---

# Project Architecture

```
src/app
│
├── components
│     └── form
│           form.component.ts
│           form.component.html
│
├── services
│     api.service.ts
│     indexeddb.service.ts
│     sync.service.ts
│
├── models
│     user.model.ts
```

---

# Responsibilities

### FormComponent

* Handles UI
* Submits form data
* Displays users list
* Listens for online events

### ApiService

Handles API communication:

```
GET /users
POST /users
```

### IndexeddbService

Stores offline records in IndexedDB.

### SyncService

Controls the **offline-first logic**:

```
Try API
↓
If API fails
↓
Store data in IndexedDB
↓
When internet returns
↓
Sync IndexedDB data to server
```

---

# Application Flow

## When Online

```
User submits form
        ↓
SyncService
        ↓
ApiService → POST /users
        ↓
Server stores data
        ↓
UI refreshes
```

---

## When Offline

```
User submits form
        ↓
API request fails
        ↓
SyncService saves data
        ↓
IndexedDB
```

---

## When Internet Returns

```
online event detected
        ↓
SyncService.syncOfflineUsers()
        ↓
Send IndexedDB records to server
        ↓
Clear IndexedDB
        ↓
Refresh UI
```

---

# Installation

Clone the project and install dependencies:

```
npm install
```

---

# Install json-server

```
npm install json-server --save-dev
```

---

# Create Database File

Create:

```
db.json
```

Add:

```
{
  "users": []
}
```

---

# Start Backend Server

Run:

```
npx json-server --watch db.json --port 3000
```

API will be available at:

```
http://localhost:3000/users
```

---

# Start Angular Application (Development Mode)

```
ng serve
```

Open:

```
http://localhost:4200
```

Note:
Service workers **do not work in ng serve**.

---

# Enable PWA (Service Worker)

Install Angular PWA support:

```
ng add @angular/pwa
```

Angular automatically:

* installs service worker
* creates `ngsw-config.json`
* updates `app.module.ts`
* adds `manifest.webmanifest`
* adds icons

---

# Service Worker Configuration

File:

```
ngsw-config.json
```

Example configuration:

```
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",

  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/index.html",
          "/*.css",
          "/*.js"
        ]
      }
    },

    {
      "name": "assets",
      "installMode": "lazy",
      "resources": {
        "files": [
          "/assets/**"
        ]
      }
    }
  ],

  "dataGroups": [
    {
      "name": "api-users",
      "urls": [
        "http://localhost:3000/users"
      ],
      "cacheConfig": {
        "strategy": "freshness",
        "maxSize": 20,
        "maxAge": "1d",
        "timeout": "5s"
      }
    }
  ]
}
```

---

# Build the PWA

Run:

```
ng build
```

Angular will create:

```
dist/<project-name>
```

---

# Serve Production Build

Use a static server:

```
npx http-server dist/<project-name>
```

Example:

```
npx http-server dist/offline-form-app
```

Open:

```
http://localhost:8080
```

---

# Verify Service Worker

Open DevTools:

```
Application → Service Workers
```

You should see:

```
ngsw-worker.js
status: activated
```

---

# Testing Offline Functionality

## Test Online Mode

1. Start Angular and json-server
2. Submit the form
3. Data should appear in:

```
http://localhost:3000/users
```

---

## Test Offline Mode

1. Open Chrome DevTools
2. Go to **Network**
3. Enable **Offline**

Submit the form.

Data will be saved in IndexedDB.

Verify:

```
DevTools
→ Application
→ IndexedDB
→ OfflineDB
→ offlineUsers
```

---

## Test Sync When Internet Returns

1. Disable Offline Mode
2. Browser triggers `online` event
3. Offline records sync to server
4. IndexedDB clears
5. UI refreshes automatically

---

# Test PWA Offline Loading

1. Load the application once **online**
2. Open DevTools
3. Go to **Network**
4. Enable **Offline**
5. Refresh the page

The **app should still load**.

---

# Offline Layers in This Project

### Layer 1 — PWA Service Worker

Caches:

```
HTML
JS
CSS
Assets
```

App loads offline.

---

### Layer 2 — API Response Cache

```
GET /users
```

Returns cached data if network fails.

---

### Layer 3 — IndexedDB Queue

Offline submissions stored locally and synced later.

---

# Future Improvements

* Background Sync API
* Offline status indicator
* Sync progress UI
* Retry strategy for failed requests
* Conflict resolution logic

---

# Author

**Vivek Biswal**

Angular Developer | Offline-First PWA Example Project

