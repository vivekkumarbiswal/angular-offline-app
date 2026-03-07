import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IndexeddbService {
  constructor(private dbService: NgxIndexedDBService) {}

  addUser(user: User): Observable<any> {
    return this.dbService.add('offlineUsers', user);
  }

  getUsers(): Observable<User[]> {
    return this.dbService.getAll('offlineUsers');
  }

  clearUsers(): Observable<any> {
    return this.dbService.clear('offlineUsers');
  }
}
