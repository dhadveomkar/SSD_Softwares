import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ReviewsComponent } from './components/reviews/reviews';

export const routes: Routes = [
    { path: '', component: Home },
  // This is the page that opens in the new tab
  { path: 'reviews/:id', component: ReviewsComponent }
];
