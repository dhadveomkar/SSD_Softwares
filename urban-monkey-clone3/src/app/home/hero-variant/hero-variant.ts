import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero-variant',
  imports: [],
  templateUrl: './hero-variant.html',
  styleUrl: './hero-variant.css',
})
export class HeroVariant {
// adjust this target if you want a CTA navigation
  shopRoute = '/last-sale';
  constructor(private router: Router) {}

  goShop() {
    this.router.navigate([this.shopRoute]);
  }
}
