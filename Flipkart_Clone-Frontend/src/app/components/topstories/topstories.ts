import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-topstories',
  imports: [CommonModule, FormsModule],
  templateUrl: './topstories.html',
  styleUrl: './topstories.css',
})
export class Topstories {
directory = [
    {
      category: 'MOST SEARCHED FOR ON FLIPKART',
      links: ['Upcoming Republic Day Sale', 'Pongal Sale', 'MOTOROLA Edge 70', 'Ray-Ban Meta Smart Glasses', 'MOTOROLA g67 power 5G', 'Wedding Sale', 'Lehenga', 'Google Pixel 10 Pro Fold']
    },
    {
      category: 'MOBILES',
      links: ['Infinix SMART 10', 'OPPO Reno 14 Pro', 'Motorola g64 5G', 'OPPO Reno 12', 'Motorola G45 5G', 'Motorola Edge 50 Fusion', 'Realme 12+ 5G']
    },
    {
      category: 'LAPTOPS',
      links: ['Asus ROG Ally', 'MacBook Pro M2', 'Premium Laptop', 'ASUS ROG Strix SCAR 16 (2023) Core i9 13th Gen', 'ASUS ROG Zephyrus M16 (2023) Core i9 13th Gen']
    },
    {
      category: 'TVS',
      links: ['TV', 'LG TV', 'Sony TV', 'Samsung TV', 'TCL TV', 'Mi TV', 'Panasonic TV', 'OnePlus TVs', 'Iffalcon Tv']
    },
    {
      category: 'CLOTHING',
      links: ['Sarees', "Men's Jeans", 'Tops', "Mens Footwear", 'Shacket', 'Designer blouses', "Women's Haldi Dress"]
    }
    // You can add more categories like FOOTWEAR, GROCERIES, etc., from image_1ded0d.png
  ];
}
