import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

type Category = {
  id: string;
  title: string;
  route: string;
  img: string; // path or url
  alt?: string;
};

@Component({
  selector: 'app-category-grid',
  imports: [CommonModule],
  templateUrl: './category-grid.html',
  styleUrl: './category-grid.css',
})
export class CategoryGrid {
constructor(private router: Router) {}

  categories: Category[] = [
    { id: 'headwear', title: 'HEADWEAR', route: '/headwear', img: 'assets/images/headwear.jpg', alt: 'Headwear' },
    { id: 'wallets', title: 'WALLETS', route: '/wallets', img: 'assets/images/wallets.jpg', alt: 'Wallets' },
    { id: 'tees', title: 'OVERSIZED TEES', route: '/tees', img: 'assets/images/tees.jpg', alt: 'Oversized Tees' },
    { id: 'eyewear', title: 'EYEWEAR', route: '/eyewear', img: 'assets/images/eyewear.jpg', alt: 'Eyewear' },
    { id: 'backpacks', title: 'BACKPACKS', route: '/backpacks', img: 'assets/images/backpack.jpg', alt: 'Backpacks' },
    { id: 'shirts', title: 'SHIRTS', route: '/shirts', img: 'assets/images/shirts.jpg', alt: 'Shirts' },
    { id: 'loop', title: 'LOOP WAITLIST', route: '/loop', img: 'assets/images/watch.jpg', alt: 'Loop Watch' },
    { id: 'upcoming', title: 'UPCOMING', route: '/upcoming', img: 'assets/images/upcoming.jpg', alt: 'Upcoming' }
  ];

  // triggered on click or keyboard Enter
  goTo(route: string) {
    // if route begins with http, use location.href or window.open.
    if (!route) return;
    this.router.navigate([route]);
  }

  // keyboard access on card: Enter or Space
  onKeydown(ev: KeyboardEvent, route: string) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this.goTo(route);
    }
  }
}
