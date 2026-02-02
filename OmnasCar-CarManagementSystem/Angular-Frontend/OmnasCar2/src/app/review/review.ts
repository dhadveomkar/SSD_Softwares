import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-review',
  imports: [CommonModule],
  templateUrl: './review.html',
  styleUrl: './review.css'
})
export class Review {
reviews = [
    { name: 'Amit', comment: 'Loved the car comparison and design!' },
    { name: 'Priya', comment: 'Very helpful for finding electric cars.' },
    { name: 'Raj', comment: 'UI is clean and fast. Great experience.' },
  ];
}
