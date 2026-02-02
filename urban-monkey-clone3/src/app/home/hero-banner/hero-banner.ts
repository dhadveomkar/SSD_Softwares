import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero-banner',
  imports: [],
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.css',
})
export class HeroBanner {
// change route to your collection route
  private shopRoute = '/last-sale';

  constructor(private router: Router) {}

  goShop() {
    this.router.navigate([this.shopRoute]);
  }
}
