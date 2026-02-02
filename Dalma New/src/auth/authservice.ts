import { Injectable } from '@angular/core';
 
@Injectable({
  providedIn: 'root'
})
export class AuthService {
 
 
  getCurrentUserRole(): string {
    return sessionStorage.getItem('userRole') || 'user';
  }
 
  isAdmin(): boolean {
    return this.getCurrentUserRole() === 'admin';
  }
 
  isManager(): boolean {
    return this.getCurrentUserRole() === 'manager';
  }
 
  isUser(): boolean {
    return this.getCurrentUserRole() === 'user';
  }
 
  logout() {
    sessionStorage.clear();
  }
 
getToken(): string | null {
  return sessionStorage.getItem('authToken');
}
 
setToken(token: string): void {
  sessionStorage.setItem('authToken', token);
}
 
}