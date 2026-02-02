import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-top-header',
  imports: [CommonModule, FormsModule],
  templateUrl: './top-header.html',
  styleUrl: './top-header.css',
})
export class TopHeader {
messages: string[] = [
    "SHADOW SERIES - LIMITED EDITION, NOW LIVE.",
    "FREE SHIPPING ON ORDERS ABOVE ₹999",
    "NEW COLLECTION DROPPING SOON!",
    "LIMITED STOCK — GRAB YOURS NOW!"
  ];
}
