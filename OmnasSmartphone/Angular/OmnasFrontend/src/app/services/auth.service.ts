import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'https://localhost:7172/api/account';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('omnas_session');
    if (savedUser) this.currentUserSubject.next(JSON.parse(savedUser));
  }

  signup(data: any) {
    return this.http.post(`${this.apiUrl}/signup`, data);
  }

  login(credentials: any) {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((user: any) => {
        localStorage.setItem('omnas_session', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout() {
    localStorage.removeItem('omnas_session');
    this.currentUserSubject.next(null);
  }

  get isLoggedIn(): boolean { return !!this.currentUserSubject.value; }
  get userRole(): string { return this.currentUserSubject.value?.role || 'Viewer'; }
}