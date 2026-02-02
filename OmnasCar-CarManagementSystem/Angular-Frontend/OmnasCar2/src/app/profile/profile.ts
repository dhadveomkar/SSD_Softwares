import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { User } from '../services/user';
import { Auth } from '../services/auth';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterModule, FormsModule, ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit{
user: User | null = null;
  isEditing = false;
  loading = true;

  contact = '';
  address = '';
  email = localStorage.getItem('email') || '';

  constructor(private authService: Auth, private location: Location) {} // ✅ Inject here

  ngOnInit(): void {
    if (this.email) {
      this.authService.getProfile(this.email).subscribe({
        next: (data) => {
          this.user = data;
          this.contact = data.contact;
          this.address = data.address;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load profile', err);
          this.loading = false;
        }
      });
    }
  }

  enableEdit(): void {
    this.isEditing = true;
  }

  save(): void {
    if (!this.user || !this.email) {
      alert('Please wait for profile to load.');
      return;
    }

    this.authService.updateProfile(this.email, this.contact, this.address).subscribe({
      next: (res) => {
        alert(res.message || 'Profile updated');
        this.user!.contact = this.contact;
        this.user!.address = this.address;
        this.isEditing = false;

        // ✅ Go back to previous page
        this.location.back();
      },
      error: (err) => {
        console.error('Update error:', err);
        alert('Update failed');
      }
    });
  }
}

