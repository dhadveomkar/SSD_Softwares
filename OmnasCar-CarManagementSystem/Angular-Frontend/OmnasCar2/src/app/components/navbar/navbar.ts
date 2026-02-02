import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
constructor(private router: Router) {}

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
  return localStorage.getItem('userRole') === 'admin';
}

}
