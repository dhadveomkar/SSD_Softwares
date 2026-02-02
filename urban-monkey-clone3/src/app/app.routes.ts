import { Routes } from '@angular/router';
import { LastSaleComponent } from './last-sale/last-sale';

export const routes: Routes = [
  // other routes
  { path: 'last-sale', component: LastSaleComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // home redirect
  { path: '**', redirectTo: '/home' }, // fallback
];

