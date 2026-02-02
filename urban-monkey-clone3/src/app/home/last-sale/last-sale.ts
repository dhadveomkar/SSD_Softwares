import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-last-sale',
  imports: [],
  templateUrl: './last-sale.html',
  styleUrl: './last-sale.css',
})
export class LastSale {
constructor(private router: Router) {}

  goShop() {
    // navigate to collection or route - update path if you use different route name
    this.router.navigate(['/last-sale']);
  }
}
