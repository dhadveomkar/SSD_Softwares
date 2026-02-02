import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
searchText = '';
  cartCount = 0; // update this from your store/service
  constructor(private router: Router) {}

  onSearch(e?: Event) {
    // prevent default if form used; navigate to search route (adjust as needed)
    // e?.preventDefault();
    if (!this.searchText.trim()) return;
    // navigate to a search-results route (change to your actual route)
    this.router.navigate(['/search'], { queryParams: { q: this.searchText.trim() } });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  openProfile() {
    this.router.navigate(['/account']);
  }
  openWishlist() {
    this.router.navigate(['/wishlist']);
  }
  openCart() {
    this.router.navigate(['/cart']);
  }
}
