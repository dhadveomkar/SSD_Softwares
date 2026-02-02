import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-slidingbanner',
  imports: [CommonModule, FormsModule],
  templateUrl: './slidingbanner.html',
  styleUrl: './slidingbanner.css',
})
export class Slidingbanner implements OnInit, OnDestroy {
  slides = [
    { url: 'https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/b9423f4fafdeff72.jpg?q=60', title: 'Flight Deals' },
    { url: 'https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/66faf3950cda0b7a.png?q=60', title: 'Mega Sale' },
    { url: 'https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/1338bd4fc60390d8.jpg?q=60', title: 'Gadget Store' },
    { url: 'https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/c1786792b3252eb0.jpg?q=60', title: 'Gadget Store' },
    { url: 'https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/1338bd4fc60390d8.jpg?q=60', title: 'Gadget Store' }
  ];

  currentIndex: number = 0;
  timeoutId: any;

  ngOnInit(): void {
    this.resetTimer();
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.timeoutId);
  }

  resetTimer() {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
    this.timeoutId = window.setTimeout(() => this.goToNext(), 5000); // Auto-slide every 5s
  }

  goToPrevious(): void {
    const isFirstSlide = this.currentIndex === 0;
    this.currentIndex = isFirstSlide ? this.slides.length - 1 : this.currentIndex - 1;
    this.resetTimer();
  }

  goToNext(): void {
    const isLastSlide = this.currentIndex === this.slides.length - 1;
    this.currentIndex = isLastSlide ? 0 : this.currentIndex + 1;
    this.resetTimer();
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
    this.resetTimer();
  }

}
