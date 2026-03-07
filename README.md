# Angular Offline-First PWA (Form Sync Example)

This project demonstrates an **offline-first Angular application** using:

* Angular Reactive Forms
* IndexedDB (via **ngx-indexed-db**)
* Sync service for retrying offline requests
* Mock backend using **json-server**

When the application is **online**, form data is sent to the server.
When the application is **offline**, form data is stored locally in **IndexedDB** and automatically synced when the internet connection returns.

---

# Tech Stack

* Angular
* Reactive Forms
* ngx-indexed-db
* RxJS
* json-server

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

### Responsibilities

**FormComponent**

* Handles UI
* Submits form data
* Displays users list

**ApiService**

* Communicates with the backend API

**IndexeddbService**

* Stores offline data in IndexedDB

**SyncService**

* Decides where data goes:

  * API (if online)
  * IndexedDB (if offline)

---

# How the Application Works

### When Online

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

### When Offline

```
User submits form
        ↓
API request fails
        ↓
SyncService stores data
        ↓
IndexedDB
```

### When Internet Returns

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

Clone the repository and install dependencies.

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

Create a file in the root directory:

```
db.json
```

Add the following content:

```
{
  "users": []
}
```

---

# Start the Backend Server

Run the mock API server:

```
npx json-server --watch db.json --port 3000
```

The API will be available at:

```
http://localhost:3000/users
```

---

# Start the Angular Application

Run the Angular development server:

```
ng serve
```

Open the application:

```
http://localhost:4200
```

---

# Testing Offline Functionality

### Test Online Mode

1. Start both Angular and json-server.
2. Submit the form.
3. Data should appear in:

```
http://localhost:3000/users
```

---

### Test Offline Mode

1. Open Chrome DevTools
2. Go to **Network Tab**
3. Enable **Offline Mode**

Submit the form.

The data will be stored in **IndexedDB**.

To verify:

```
DevTools
→ Application
→ IndexedDB
→ OfflineDB
→ offlineUsers
```

---

### Test Sync When Internet Returns

1. Disable Offline Mode in DevTools.
2. The `online` event will trigger synchronization.
3. Offline records will be sent to the server.
4. IndexedDB will be cleared.
5. UI will refresh automatically.

---

# Future Improvements

* Add Angular Service Worker for full PWA support
* Cache API responses
* Add retry strategy for failed sync
* Add background sync support
* Show sync status in UI

---

# Author

Offline-First Angular Example Project
