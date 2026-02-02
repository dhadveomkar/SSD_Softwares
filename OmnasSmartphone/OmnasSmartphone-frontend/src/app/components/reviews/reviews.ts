import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Review } from '../../models/review';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.html',
  styleUrls: ['./reviews.css'],
})
export class ReviewsComponent implements OnChanges {

  @Input() phoneId!: number;
  @Output() closeModal = new EventEmitter<void>(); // Added to notify parent

  reviews: Review[] = [];
  ratingSummary: any;

  newReview: Review = {
    smartphoneId: 0,
    customerName: '',
    rating: 5,
    comment: ''
  };

  constructor(private reviewService: ReviewService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['phoneId'] && this.phoneId) {
      this.loadReviews();
    }
  }

  // Emits an event so the parent can set selectedPhoneId = undefined
  onClose(): void {
    this.closeModal.emit();
  }

  loadReviews(): void {
    if (!this.phoneId) return;

    this.newReview.smartphoneId = this.phoneId;

    this.reviewService.getReviews(this.phoneId).subscribe({
      next: (res: Review[]) => this.reviews = res,
      error: (err) => console.error('Error loading reviews:', err)
    });

    this.reviewService.getRating(this.phoneId).subscribe({
      next: (res: any) => this.ratingSummary = res,
      error: (err) => console.error('Error loading rating summary:', err)
    });
  }

  submitReview() {
    if (!this.newReview.customerName || !this.newReview.comment) {
      alert("Please fill in your name and comment!");
      return;
    }

    this.reviewService.addReview(this.newReview).subscribe(() => {
      this.newReview = {
        smartphoneId: this.phoneId,
        customerName: '',
        rating: 5,
        comment: ''
      };
      this.loadReviews();
    });
  }

  deleteReview(id: number) {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewService.deleteReview(id).subscribe(() => this.loadReviews());
    }
  }
}