import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { authInterceptor } from '../auth/authinterceptor';
import { routes } from './app.routes';
 
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
   provideClientHydration(),
    provideHttpClient(withInterceptors([authInterceptor])), // ✅ functional interceptor
    MessageService,
    provideAnimations()
  ]
};