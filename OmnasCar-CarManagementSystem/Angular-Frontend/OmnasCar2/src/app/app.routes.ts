import { Routes } from '@angular/router';
import { Titleparagraph } from './components/titleparagraph/titleparagraph';
import { Homepageimage } from './components/homepageimage/homepageimage';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { LatestCar } from './latest-car/latest-car';
import { UpcomingCar } from './upcoming-car/upcoming-car';
import { ElectricCar } from './electric-car/electric-car';
import { About } from './about/about';
import { Contact } from './contact/contact';
import { Review } from './review/review';
import { Profile } from './profile/profile';
import { ViewAllCars } from './view-all-cars/view-all-cars';
import { AuthGuard } from './guards/auth-guard'; // ✅ import guard
import { AdminCarManagement } from './admin-car-management/admin-car-management';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'admin/manage-cars', component: AdminCarManagement },
  

  // ✅ Protected routes
  { path: 'home', component: Titleparagraph, canActivate: [AuthGuard] },
  { path: 'image', component: Homepageimage, canActivate: [AuthGuard] },
  { path: 'cars/latest', component: LatestCar, canActivate: [AuthGuard] },
  { path: 'cars/upcoming', component: UpcomingCar, canActivate: [AuthGuard] },
  { path: 'cars/electric', component: ElectricCar, canActivate: [AuthGuard] },
  { path: 'cars/all', component: ViewAllCars, canActivate: [AuthGuard] },
  { path: 'about', component: About, canActivate: [AuthGuard] },
  { path: 'contact', component: Contact, canActivate: [AuthGuard] },
  { path: 'review', component: Review, canActivate: [AuthGuard] },
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },

  // fallback route
  { path: '**', redirectTo: 'login' }
];
