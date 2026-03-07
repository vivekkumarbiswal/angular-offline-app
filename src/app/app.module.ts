import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FormComponent } from './components/form/form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';

const dbConfig: DBConfig = {
  name: 'OFFLINEDB',
  version: 1,
  objectStoresMeta: [
    {
      store: 'offlineUsers',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'email', keypath: 'email', options: { unique: false } },
      ],
    },
  ],
};

@NgModule({
  declarations: [AppComponent, FormComponent],
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    ReactiveFormsModule,
    HttpClientModule,
    NgxIndexedDBModule.forRoot(dbConfig),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
