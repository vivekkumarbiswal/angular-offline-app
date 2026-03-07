import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { IndexeddbService } from './indexeddb.service';
import { User } from '../models/user.model';
import { from, of } from 'rxjs';
import { switchMap, mergeMap, toArray, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  constructor(
    private apiService: ApiService,
    private indexeddbService: IndexeddbService,
  ) {}

  submitUser(user: User) {
    this.apiService.addUser(user).subscribe({
      next: () => {
        console.log('Saved to server');
      },
      error: () => {
        console.log('Server failed -> saving offline');

        this.indexeddbService.addUser(user).subscribe(() => {
          console.log('Saved to IndexedDb');
        });
      },
    });
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
