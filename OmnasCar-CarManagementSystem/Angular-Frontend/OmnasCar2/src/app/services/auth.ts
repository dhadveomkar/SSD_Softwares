import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from './user';


@Injectable({
  providedIn: 'root'
})
export class Auth {

  private baseUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  signup(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, user);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }
  getProfile(email: string): Observable<User> {
  return this.http.get<User>(`${this.baseUrl}/profile?email=${email}`);
}

updateProfile(email: string, contact: string, address: string): Observable<any> {
  return this.http.put(`${this.baseUrl}/update`, {
    email,
    contact,
    address
  });
}

}
