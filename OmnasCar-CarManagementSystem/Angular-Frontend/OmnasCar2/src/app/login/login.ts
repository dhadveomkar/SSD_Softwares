import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../services/auth';
import { User } from '../services/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']  // ✅ corrected from styleUrl
})
export class Login {
  email: string = '';
  password: string = '';

  constructor(private authService: Auth, private router: Router) {}

  onLogin(): void {
    const credentials = {
      email: this.email.trim(),
      password: this.password.trim()
    };

    this.authService.login(credentials).subscribe({
      next: (res) => {
        console.log('Login response:', res);
        alert(res.message || 'Login successful!');

        // ✅ Store login flag
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('email', credentials.email);

        // ✅ Navigate to home or car listing page
        this.router.navigate(['/cars/latest']);
      },
      error: (err) => {
        console.error('Login error:', err);
        alert(err?.error?.message || 'Invalid credentials!');
      }
    });
  }
}
