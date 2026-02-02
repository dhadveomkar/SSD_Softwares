import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type Slide = {
  id: number;
  title: string;       // left big title (can contain newlines)
  subtitle?: string;   // small subtitle under title
  cta?: string;        // CTA label
  img: string;         // image path
  captionRight?: string; // small right-side text (optional)
};

@Component({
  selector: 'app-hero-slider',
  imports: [CommonModule, FormsModule],
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.css',
})
export class HeroSlider {
constructor(private router: Router) {}

  slides: Slide[] = [
    {
      id: 1,
      title: 'INTRODUCING\nUMSYSTEMS',
      subtitle: 'BAGS',
      cta: 'SHOP BAGS',
      img: 'https://www.urbanmonkey.com/cdn/shop/files/519.png?v=1761908587&width=2000',
      captionRight: 'UM SHADOW PACK\nSLING BAG'
    },
    {
      id: 2,
      title: 'NEW DROP\nWINTER 2025',
      subtitle: 'HOODIES',
      cta: 'SHOP WINTER',
      img: 'assets/images/hero-hoodie.jpg',
      captionRight: 'COZY HOODIES\nPLUSH SWEATSHIRTS'
    },
    {
      id: 3,
      title: 'LIMITED EDITION\nCOLLECTION',
      subtitle: 'ACCESSORIES',
      cta: 'SHOP ACCESSORIES',
      img: 'assets/images/hero-accessory.jpg',
      captionRight: 'LIMITED RUN'
    }
  ];

  current = 0;
  isAnimating = false;
  private ANIM_MS = 320;

  // move to next slide
  next() {
    if (this.isAnimating) return;
    this.changeTo((this.current + 1) % this.slides.length);
  }

  // move to previous slide
  prev() {
    if (this.isAnimating) return;
    this.changeTo((this.current - 1 + this.slides.length) % this.slides.length);
  }

  private changeTo(index: number) {
    // immediate index change then animate fade-in
    this.isAnimating = true;
    this.current = index;
    setTimeout(() => (this.isAnimating = false), this.ANIM_MS);
  }

  // keyboard support
  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'ArrowRight') this.next();
  }

  // CTA click navigation (adjust routes as needed)
  onCtaClick(slide: Slide) {
    // example route: navigate to /collections/<id> (change to your routes)
    // this.router.navigate(['/collections', slide.id]);
    // For now just log or navigate to a generic page
    this.router.navigate(['/last-sale']);
  }
}
