import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './authservice';
 
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
 
  const token = authService.getToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
 
  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      console.warn('Interceptor caught status:', err.status);
      console.log('Interceptor caught status:', err.status);
      // if (err.status === 401) {
      //   console.warn('Session expired → logging out...');
      //   authService.logout();          // clear token/session
      //   router.navigate(['/login-page']); // navigate to login
      // }
 
      if (err.status === 401 || err.status === 0) {
        console.warn('Session expired → logging out...');
        authService.logout();          // clear token/session
        router.navigate(['/login-page']); // navigate to login
      }
 
      return throwError(() => err);
    })
  );
};