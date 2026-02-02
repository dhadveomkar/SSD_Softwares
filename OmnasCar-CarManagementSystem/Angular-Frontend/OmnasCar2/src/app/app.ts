import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { Navbar } from './components/navbar/navbar';
import { CardviewFeatures } from './cardview-features/cardview-features';
import { Footer } from './footer/footer';
import { CommonModule } from '@angular/common';
import { BrandCard } from './brand-card/brand-card';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule , Navbar, CardviewFeatures, Footer, CommonModule, BrandCard],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit{
  banners = [
    {
      image: 'OIP.jpeg',
      title: '🚗 Discover Latest Cars',
      description: 'Browse the newest car launches across top brands in India.'
    },
    {
      image: 'OIP1.jpeg',
      title: '🕒 Upcoming Cars 2025',
      description: 'Get early access to future car releases with expected prices and launch dates.'
    },
    {
      image: 'OIP2.jpeg',
      title: '⚡ Drive Electric Today',
      description: 'Explore powerful and eco-friendly electric cars with the latest EV tech.'
    },
    {
      image: 'OIP3.jpeg',
      title: '💰 Compare & Save',
      description: 'Easily compare features, specs, and prices to find the best value.'
    },
    {
      image: 'OIP4.jpeg',
      title: '⭐ Trusted Car Reviews',
      description: 'Make informed decisions with expert and user reviews of every car.'
    }
  ];

  currentIndex = 0;
  intervalId: any;

  ngOnInit(): void {
    
  }

  

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.banners.length;
  }

  prevSlide() {
    this.currentIndex =
      (this.currentIndex - 1 + this.banners.length) % this.banners.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  brands = [
    { name: 'Hyundai', logo: 'Hyundai.jpeg' },
    { name: 'Tata', logo: 'Tata.jpeg' },
    { name: 'Maruti Suzuki', logo: 'Suzuki.jpeg' },
    { name: 'Mahindra', logo: 'Mahindra.jpeg' },
    { name: 'Kia', logo: 'Kia.jpeg' },
    // Add more brands as needed
  ];
}
