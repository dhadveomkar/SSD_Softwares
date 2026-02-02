import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

type Review = {
  id: number;
  name: string;
  verified?: boolean;
  rating: number;
  text: string;
  tagline?: string;
};

@Component({
  selector: 'app-reviews',
  imports: [CommonModule],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class Reviews {
reviews: Review[] = [
    {
      id: 1,
      name: 'ROHITMAHESHWARI',
      verified: true,
      rating: 5,
      text: 'FRONT OF THE THIS TSHIRT IS VERY CLASSY & BACK SIDE IS DOPE!!',
      tagline: 'AMPED_MTV X URBAN MONKEY'
    },
    {
      id: 2,
      name: 'PRIYA S.',
      verified: false,
      rating: 4,
      text: 'Great material and fit — loved the print quality.',
      tagline: 'COMFORT + STYLE'
    },
    {
      id: 3,
      name: 'AMIT K',
      verified: true,
      rating: 5,
      text: 'Fast shipping. Product matches the pictures.',
      tagline: 'WORTH THE MONEY'
    }
  ];

  averageRating = this.computeAverage();
  totalReviews = this.reviews.length;

  currentIndex = 0;

  // when true, we add a CSS "fade-in" animation class to the card
  isAnimating = false;

  // animation duration in ms (must match CSS)
  private readonly ANIM_MS = 300;

  get flooredAverage(): number {
    return Math.floor(this.averageRating);
  }
  get hasHalfStar(): boolean {
    return this.averageRating - Math.floor(this.averageRating) >= 0.5;
  }

  stars(n: number) {
    return new Array(n);
  }

  private computeAverage(): number {
    if (!this.reviews.length) return 0;
    const sum = this.reviews.reduce((s, r) => s + r.rating, 0);
    return Math.round((sum / this.reviews.length) * 100) / 100;
  }

  // navigate to previous review
  prev() {
    if (this.isAnimating) return; // guard to prevent spamming
    const nextIdx = (this.currentIndex - 1 + this.reviews.length) % this.reviews.length;
    this.changeTo(nextIdx);
  }

  // navigate to next review
  next() {
    if (this.isAnimating) return;
    const nextIdx = (this.currentIndex + 1) % this.reviews.length;
    this.changeTo(nextIdx);
  }

  // update index immediately then run a fade-in animation
  private changeTo(newIndex: number) {
    this.isAnimating = true;
    // update content immediately — prevents blank render
    this.currentIndex = newIndex;

    // remove animation class after duration
    setTimeout(() => {
      this.isAnimating = false;
    }, this.ANIM_MS);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(ev: KeyboardEvent) {
    if (ev.key === 'ArrowLeft') this.prev();
    if (ev.key === 'ArrowRight') this.next();
  }
}
