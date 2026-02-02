import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  return true;
};

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
    }
    return isLoggedIn;
  }
}