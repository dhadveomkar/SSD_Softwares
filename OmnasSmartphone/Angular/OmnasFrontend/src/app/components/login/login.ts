import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
// Fixes: Property 'loginData' does not exist
  loginData = { email: '', password: '' };

  constructor(public authService: AuthService, private router: Router) {}

  // Fixes: Property 'handleLogin' does not exist
  handleLogin() {
  this.authService.login(this.loginData).subscribe({
    next: (user) => {
      console.log('Login successful', user);
      // Navigate to your protected inventory list
      this.router.navigate(['/device-list']); 
    },
    error: (err) => alert('Invalid credentials')
  });
}
}
