import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-furnituredeal',
  imports: [CommonModule, FormsModule],
  templateUrl: './furnituredeal.html',
  styleUrl: './furnituredeal.css',
})
export class Furnituredeal {
@ViewChild('scrollContainer') scrollContainer!: ElementRef;

  furnitureItems = [
    { name: 'Mattresses', price: 'From ₹2,990', imageUrl: 'https://rukminim1.flixcart.com/image/240/240/j5ihlzk0/bed-mattress/2/y/c/6-48-75-skbnnldb75x48x06-bonnell-spring-peps-original-imaevnpjqz2mwyrz.jpeg?q=60' },
    { name: 'Sofa & Sectional', price: 'From ₹7,999', imageUrl: 'https://rukminim1.flixcart.com/image/240/240/l4d2ljk0/sofa-sectional/x/j/l/left-facing-180-34-aqua-blue-241-3-polyester-80-steffan-l-sheped-original-imagf9zer8ptqhrh.jpeg?q=60' },
    { name: 'Office Study Chairs', price: 'From ₹1,890', imageUrl: 'https://rukminim1.flixcart.com/image/240/240/xif0q/office-study-chair/z/t/2/1-teak-sagun-58-42-js-29-beaatho-121-92-original-imagrwgshgp2bhwv.jpeg?q=60' },
    { name: 'Beds', price: 'From ₹1,790', imageUrl: 'https://rukminim1.flixcart.com/image/240/240/jm9hfgw0/bed/h/g/g/king-na-rosewood-sheesham-bkwl05nhbs0401d1p-flipkart-perfect-original-imaf97cwhvgnwg95.jpeg?q=60' },
    { name: 'TV Units', price: 'From ₹1,249', imageUrl: 'https://rukminim1.flixcart.com/image/240/240/kb9ou4w0/tv-entertainment-unit/f/x/h/particle-board-za0022wh-barewether-white-with-walnut-original-imafsnnntmvsysap.jpeg?q=60' },
    { name: 'Sofa Beds', price: 'From ₹6,099', imageUrl: 'https://rukminim1.flixcart.com/image/240/240/xif0q/sofa-bed/3/q/4/-original-imagm9ckhma9u8a3.jpeg?q=60' },
    { name: 'Sofa Set', price: 'From ₹21,999', imageUrl: 'https://rukminim1.flixcart.com/image/240/240/xif0q/sofa-set/x/o/p/blue-cotton-3-2-1-1-sofa-set-blue-amorini-aqua-blue-original-imagwgmtf5gu4ycc.jpeg?q=60' },
    { name: 'Sofa Beds', price: 'From ₹6,099', imageUrl: 'https://rukminim1.flixcart.com/image/240/240/jsc3ssw0/sofa-bed/z/u/m/double-beige-jute-ritz-sofa-bed-beige-sofame-brown-original-imafdxg7dgg3tkty.jpeg?q=60' }
  ];

  scroll(direction: number) {
    // Scrolls by roughly 2 product widths
    this.scrollContainer.nativeElement.scrollBy({
      left: direction * 500,
      behavior: 'smooth'
    });
  }
}
