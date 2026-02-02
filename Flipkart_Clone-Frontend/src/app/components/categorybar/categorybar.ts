import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface SubItem {
  name: string;
}

interface SubCategory {
  title: string;
  items: SubItem[];
}

interface Category {
  id: number;
  name: string;
  imageUrl: string;
  hasDropdown: boolean;
  isNew?: boolean;
  subCategories?: SubCategory[];
}

@Component({
  selector: 'app-categorybar',
  imports: [CommonModule, FormsModule],
  templateUrl: './categorybar.html',
  styleUrl: './categorybar.css',
})

export class Categorybar {
categories: Category[] = [
    { id: 1, name: 'Minutes', imageUrl: 'https://rukminim2.flixcart.com/fk-p-flap/64/64/image/e00302d428f5c7be.png?q=100', hasDropdown: false, isNew: true },
    { id: 2, name: 'Mobiles & Tablets', imageUrl: 'https://rukminim2.flixcart.com/fk-p-flap/64/64/image/5f2ee7f883cdb774.png?q=100', hasDropdown: false },
    { 
      id: 3, 
      name: 'Fashion', 
      imageUrl: 'https://rukminim2.flixcart.com/fk-p-flap/64/64/image/ff559cb9d803d424.png?q=100', 
      hasDropdown: true,
      subCategories: [
        {
          title: "Men's Top Wear",
          items: [{ name: 'All' }, { name: "Men's T-Shirts" }, { name: "Men's Casual Shirts" }, { name: "Men's Formal T-Shirts" }, { name: "Men's Kurtas" }, { name: "Men's Ethnic Sets" }, { name: "Men's Blazers" }, { name: "Men's Raincoat" }, { name: "Men's Windcheaters" }, { name: "Men's Suit" }, { name: "Men's Fabrics" }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }]
        },
        // Add more as per the image...
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
      ]
    },
    { 
      id: 4, 
      name: 'Electronics', 
      imageUrl: 'https://rukminim2.flixcart.com/fk-p-flap/64/64/image/af646c36d74c4be9.png?q=100', 
      hasDropdown: true,
      subCategories: [
        {
          title: "Men's Top Wear",
          items: [{ name: 'All' }, { name: "Men's T-Shirts" }, { name: "Men's Casual Shirts" }, { name: "Men's Formal T-Shirts" }, { name: "Men's Kurtas" }, { name: "Men's Ethnic Sets" }, { name: "Men's Blazers" }, { name: "Men's Raincoat" }, { name: "Men's Windcheaters" }, { name: "Men's Suit" }, { name: "Men's Fabrics" }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }]
        },
        // Add more as per the image...
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
      ]
    },
    { id: 5, name: 'TVs & Appliances', imageUrl: 'https://rukminim2.flixcart.com/fk-p-flap/64/64/image/e90944802d996756.jpg?q=100', hasDropdown: false },
    { 
      id: 6, 
      name: 'Home & Furniture', 
      imageUrl: 'https://rukminim2.flixcart.com/fk-p-flap/64/64/image/1788f177649e6991.png?q=100', 
      hasDropdown: true,
      subCategories: [
        {
          title: "Men's Top Wear",
          items: [{ name: 'All' }, { name: "Men's T-Shirts" }, { name: "Men's Casual Shirts" }, { name: "Men's Formal T-Shirts" }, { name: "Men's Kurtas" }, { name: "Men's Ethnic Sets" }, { name: "Men's Blazers" }, { name: "Men's Raincoat" }, { name: "Men's Windcheaters" }, { name: "Men's Suit" }, { name: "Men's Fabrics" }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }]
        },
        // Add more as per the image...
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
      ]
    },
    { id: 7, name: 'Flight Bookings', imageUrl: 'https://rukminim2.flixcart.com/fk-p-flap/64/64/image/3c647c2e0d937dc5.png?q=100', hasDropdown: false },
    { 
      id: 8, 
      name: 'Beauty, Food..', 
      imageUrl: 'https://rukminim2.flixcart.com/fk-p-flap/64/64/image/b3020c99672953b9.png?q=100', 
      hasDropdown: true,
      subCategories: [
        {
          title: "Men's Top Wear",
          items: [{ name: 'All' }, { name: "Men's T-Shirts" }, { name: "Men's Casual Shirts" }, { name: "Men's Formal T-Shirts" }, { name: "Men's Kurtas" }, { name: "Men's Ethnic Sets" }, { name: "Men's Blazers" }, { name: "Men's Raincoat" }, { name: "Men's Windcheaters" }, { name: "Men's Suit" }, { name: "Men's Fabrics" }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }, { name: "Men's T-Shirts" }]
        },
        // Add more as per the image...
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
        {
          title: "Men's Bottom Wear",
          items: [{ name: 'All' }, { name: 'Men\'s Jeans' }, { name: 'Men\'s Trousers' }]
        },
      ]
    },
    { id: 9, name: 'Grocery', imageUrl: 'https://rukminim2.flixcart.com/fk-p-flap/64/64/image/e730a834ad950bae.png?q=100', hasDropdown: false },
  ];
}
