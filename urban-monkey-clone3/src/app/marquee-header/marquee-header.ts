import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-marquee-header',
  imports: [CommonModule, FormsModule],
  templateUrl: './marquee-header.html',
  styleUrl: './marquee-header.css',
})
export class MarqueeHeader {
// messages shown in the loop; edit these as needed
  messages: string[] = [
    'SHADOW SERIES - LIMITED EDITION, NOW LIVE.',
    'FREE SHIPPING ON ORDERS ABOVE ₹999',
    'NEW DROP: WINTER 2025 COLLECTION',
    'UP TO 70% OFF SELECTED ITEMS'
  ];

  // seconds for a full loop (smaller = faster)
  loopSeconds = 20;

  // when true, the animation is paused (via button, keyboard or hover)
  isPaused = false;

  // toggle pause (used by button)
  togglePause() {
    this.isPaused = !this.isPaused;
  }

  // keyboard: when component focused, Space or Enter toggles pause
  @HostListener('keydown', ['$event'])
  onKeydown(ev: KeyboardEvent) {
    if (ev.key === ' ' || ev.key === 'Spacebar' || ev.key === 'Enter') {
      ev.preventDefault();
      this.togglePause();
    }
  }

  // helper: returns CSS value for animation-duration
  animationDuration(): string {
    return `${this.loopSeconds}s`;
  }
}
