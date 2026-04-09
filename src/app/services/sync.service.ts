import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { IndexeddbService } from './indexeddb.service';
import { User } from '../models/user.model';
import { from, of, Observable, throwError } from 'rxjs';
import { switchMap, mergeMap, toArray, tap, catchError, map, concatMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  constructor(
    private apiService: ApiService,
    private indexeddbService: IndexeddbService,
  ) {}

  submitUser(user: User): Observable<any> {
    if (!navigator.onLine) {
      console.log('Offline → saving to IndexedDB');
      return this.indexeddbService.addUser(user);
    }

    return this.apiService.addUser(user).pipe(
      catchError((error) => {
        console.error('Server failed → saving offline', error);
        return this.indexeddbService.addUser(user);
      }),
    );
  }

  syncOfflineUsers(): Observable<any[]> {
    return this.indexeddbService.getUsers().pipe(
      switchMap((users) => {
        if (!users || users.length === 0) {
          return of([]);
        }

        console.log(`Syncing ${users.length} users...`);

        // Process users one by one to handle errors and clear carefully
        return from(users).pipe(
          concatMap((user) =>
            this.apiService.addUser({ name: user.name, email: user.email }).pipe(
              // If success, we don't need to do anything here, we'll clear all if everything succeeds
              // Better: transform into a success object
              map(() => ({ user, status: 'success' })),
              catchError((err) => {
                console.error(`Failed to sync user ${user.name}`, err);
                return of({ user, status: 'failed' });
              }),
            ),
          ),
          toArray(),
          switchMap((results) => {
            const successfullySynced = results
              .filter((r) => r.status === 'success')
              .map((r) => r.user);
            
            if (successfullySynced.length === 0) {
              return of([]);
            }

            // In a real app, we'd clear only successfully synced records by ID.
            // For now, if anything synced, we clear and let the remaining (if any) stay or we handle them.
            // Simplifying: if we synced everything, clear all.
            const allSucceeded = results.every(r => r.status === 'success');
            if (allSucceeded) {
              return this.indexeddbService.clearUsers().pipe(map(() => results));
            } else {
              // Partial success is tricky with 'clearUsers'.
              // Ideally indexeddbService should have deleteUser(id).
              // For this demo, let's assume we want to clear whatever we can.
              // To stay safe and avoid duplicates, we only clear if ALL succeeded or handle individually.
              console.warn('Partial sync success. Some records might remain in IndexedDB.');
              // We'll return the results for the UI to handle
              return of(results);
            }
          }),
        );
      }),
    );
  }
}
