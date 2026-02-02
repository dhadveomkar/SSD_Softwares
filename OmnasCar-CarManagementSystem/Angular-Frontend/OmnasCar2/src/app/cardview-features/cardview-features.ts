import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cardview-features',
  imports: [CommonModule],
  templateUrl: './cardview-features.html',
  styleUrl: './cardview-features.css'
})
export class CardviewFeatures {
features = [
    {
      title: 'Compare Cars',
      description: 'Compare specs, prices & performance side-by-side.',
      image: 'comparecar.jpeg'
    },
    {
      title: 'Search by Budget',
      description: 'Find cars that fit your price range easily.',
      image: 'budgetcar.jpeg'
    },
    {
      title: 'Electric Vehicle Insights',
      description: 'Browse top EVs, charging info & savings tips.',
      image: 'evcar.jpeg'
    },
    {
      title: 'Car Reviews',
      description: 'User & expert reviews to guide your decision.',
      image: 'review.jpeg'
    }
  ];
}
