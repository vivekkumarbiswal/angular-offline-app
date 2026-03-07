import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { IndexeddbService } from './indexeddb.service';
import { User } from '../models/user.model';
import { from, of } from 'rxjs';
import { switchMap, mergeMap, toArray, tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  constructor(
    private apiService: ApiService,
    private indexeddbService: IndexeddbService,
  ) {}

  submitUser(user: User) {
    if (!navigator.onLine) {
      console.log('Offline → saving to IndexedDB');

      return this.indexeddbService.addUser(user);
    }

    return this.apiService.addUser(user).pipe(
      catchError(() => {
        console.log('Server failed → saving offline');

        return this.indexeddbService.addUser(user);
      }),
    );
  }

  syncOfflineUsers() {
    return this.indexeddbService.getUsers().pipe(
      switchMap((users) => {
        if (!users.length) {
          return of([]);
        }

        return from(users).pipe(
          mergeMap((user) =>
            this.apiService.addUser({
              name: user.name,
              email: user.email,
            }),
          ),

          toArray(),

          switchMap(() => this.indexeddbService.clearUsers()),
        );
      }),
    );
  }
}
