import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  showSuggestions = false;
onLogin() {
    console.log('Login clicked');
  }

  onCart() {
    console.log('Cart clicked');
  }

  onSeller() {
    console.log('Become a Seller clicked');
  }

  onMenu() {
    console.log('Menu clicked');
  }

  showLoginMenu = false;
  showMoreMenu = false;

  toggleLoginMenu() {
    this.showLoginMenu = !this.showLoginMenu;
    this.showMoreMenu = false;
  }

  toggleMoreMenu() {
    this.showMoreMenu = !this.showMoreMenu;
    this.showLoginMenu = false;
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.login-wrapper')) {
      this.showLoginMenu = false;
    }

    if (!target.closest('.more-wrapper')) {
      this.showMoreMenu = false;
    }
  }

  // Call this from (mouseenter)="handleMouseEnter()" on the wrapper
handleMouseEnter() {
  this.showLoginMenu = true;
}

// Call this from (mouseleave)="handleMouseLeave()" on the wrapper
handleMouseLeave() {
  this.showLoginMenu = false;
}

// Replace this with your actual image URL
  logoUrl = 'https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-11f9e2.svg';

// Call this on (blur)
hideSuggestionsWithDelay() {
  setTimeout(() => {
    this.showSuggestions = false;
  }, 200); // 200ms delay to capture the click on a list item
}
}
