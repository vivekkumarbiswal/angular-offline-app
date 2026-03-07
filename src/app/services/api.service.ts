import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private bashUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.bashUrl);
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.bashUrl, user);
  }
}
