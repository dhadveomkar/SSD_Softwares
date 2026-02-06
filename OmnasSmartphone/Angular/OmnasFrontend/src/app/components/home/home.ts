import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { DeviceList } from "../device-list/device-list";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [DeviceList, FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})



export class Home 


implements OnInit , OnDestroy {

  constructor(public authService: AuthService) {}
  
  
// Array of banner images
  banners = [
    { url: 'https://tse2.mm.bing.net/th/id/OIP.-3v9Aowg1p334fhnhrh07QHaD8?pid=Api&P=0&h=180', title: 'Latest Flagships', desc: 'Manage S24 & iPhone 15 series.' },
    { url: 'https://tse4.mm.bing.net/th/id/OIP.A6Lu5Q4LGNtfx3cnv8CerQHaE7?pid=Api&P=0&h=180', title: 'Enterprise Security', desc: 'Secure your fleet globally.' },
    { url: 'https://tse3.mm.bing.net/th/id/OIP.NHhqVwtUNknKxGVl94gXqAHaGT?pid=Api&P=0&h=180', title: 'Instant Sync', desc: 'Real-time data at your fingertips.' }
  ];

currentSlide = 0;
  slideInterval: any;
  isPageLoaded = false;
  isScrolled = false;


// Detects window scroll to change navbar style
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  ngOnInit() {
    this.startTimer();
    setTimeout(() => this.isPageLoaded = true, 100);
  }
  
scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  startTimer() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 4000); // Change image every 4 seconds
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.banners.length;
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval); // Clean up memory
    }
  }
}
