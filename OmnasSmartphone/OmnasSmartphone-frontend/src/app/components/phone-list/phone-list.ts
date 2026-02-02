import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Smartphonemodels } from '../../models/smartphonemodels/smartphonemodels';
import { Smartphoneservices } from '../../services/smartphoneservices/smartphoneservices';
import { ReviewsComponent } from "../reviews/reviews";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-phone-list',
  imports: [CommonModule, ReviewsComponent, FormsModule],
  templateUrl: './phone-list.html',
  styleUrl: './phone-list.css',
})
export class PhoneList implements OnInit {
  // 1. Declare the property that the HTML is looking for
  phones: Smartphonemodels[] = []; 
selectedPhoneId?: number;
  constructor(private Smartphoneservices: Smartphoneservices) {}

  ngOnInit(): void {
    // 2. Fetch the data from the backend to fill the array
    this.Smartphoneservices.getSmartphones().subscribe({
      next: (data: Smartphonemodels[]) => {
        this.phones = data;
      },
      error: (err: Error) => {
        console.error('Could not fetch phones', err);
      }
    });
  }

  openReviews(phoneId?: number): void {
  if (phoneId === undefined || phoneId === null) return;
  this.selectedPhoneId = phoneId;
}

}
