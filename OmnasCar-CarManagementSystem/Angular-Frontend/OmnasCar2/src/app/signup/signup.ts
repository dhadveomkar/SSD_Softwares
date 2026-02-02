import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Auth } from '../services/auth';
import { User } from '../services/user';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
user: User = {
    name: '',
    email: '',
    contact: '',
    address: '',
    password: ''
  };

  constructor(private authService: Auth) {}

  onSubmit(): void {
  this.authService.signup(this.user).subscribe({
    next: (res) => {
  console.log('Signup response:', res);
  alert(res.message || 'Signup successful!');
},
    error: (err) => {
  console.error('Signup error:', err);
  const errorMsg = err?.error?.message || 'Signup failed!';
  alert(errorMsg);
}
  });
}
}
