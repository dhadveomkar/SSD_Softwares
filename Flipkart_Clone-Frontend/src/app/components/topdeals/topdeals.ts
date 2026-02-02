import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Product {
  name: string;
  priceTag: string;
  imageUrl: string;
}

@Component({
  selector: 'app-topdeals',
  imports: [CommonModule, FormsModule],
  templateUrl: './topdeals.html',
  styleUrl: './topdeals.css',
})
export class Topdeals {
@ViewChild('scrollContainer') scrollContainer!: ElementRef;

  products = [
    { name: 'Projector', priceTag: 'From ₹6990', imageUrl: 'https://rukminim2.flixcart.com/image/240/240/xif0q/projector/x/s/t/i9-pro-max-fhd-1080p-e03i31-10-e03i31-led-projector-egate-original-imahgxvbyhh7uejw.jpeg?q=60' },
    { name: 'Best Selling Mobile S...', priceTag: 'From ₹499*', imageUrl: 'https://rukminim2.flixcart.com/image/240/240/kcf4lu80/speaker/mobile-tablet-speaker/h/u/f/srs-xb23-sony-original-imaftk66vjxp86h5.jpeg?q=60' },
    { name: 'Monitors', priceTag: 'From ₹6599', imageUrl: 'https://rukminim2.flixcart.com/image/240/240/xif0q/monitor/p/w/w/-original-imahg9bfku8q2neg.jpeg?q=60' },
    { name: 'Monitor', priceTag: 'From ₹8279', imageUrl: 'https://rukminim2.flixcart.com/image/240/240/xif0q/monitor/w/i/f/-original-imahagy2cefszqgy.jpeg?q=60' },
    { name: 'Top Mirrorless Came...', priceTag: 'Shop Now!', imageUrl: 'https://rukminim2.flixcart.com/image/240/240/xif0q/camera/s/o/y/na-digital-kids-camera-20mp-1080p-32gb-card-supported-mini-original-imagy2znwq4uy4z8.jpeg?q=60' },
    { name: 'Fastrack Smartwatc...', priceTag: 'From ₹1,399', imageUrl: 'https://rukminim2.flixcart.com/image/240/240/xif0q/smartwatch/5/v/s/-original-imagxrhetgfuebnn.jpeg?q=60' },
    { name: 'Best Truewireless H...', priceTag: 'Grab Now', imageUrl: 'https://rukminim2.flixcart.com/image/240/240/l58iaa80/headphone/k/z/m/nord-buds-ce-oneplus-original-imagfyk4hyvgg6ze.jpeg?q=60' },
    { name: 'Printers', priceTag: 'From ₹2336', imageUrl: 'https://rukminim2.flixcart.com/image/240/240/xif0q/printer/s/8/d/-original-imafkykednshkhx5.jpeg?q=60' }
  ];

  // Function to handle the smooth scroll
  scroll(direction: number) {
    const scrollAmount = 400; 
    this.scrollContainer.nativeElement.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth'
    });
  }

  onViewAll() {
    console.log("Navigating to all deals...");
    // You can add router navigation here later
  }
}
