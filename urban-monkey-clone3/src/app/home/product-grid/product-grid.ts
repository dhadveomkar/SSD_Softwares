import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

type Product = {
  id: number;
  title: string;
  price: string;
  img: string;
  badge?: string;     // e.g. 'NEW ARRIVAL'
  tags?: string[];    // categories for filtering
  favorite?: boolean;
};

@Component({
  selector: 'app-product-grid',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.css',
})
export class ProductGrid {
constructor(private router: Router) {}

  // category chips
  categories = [
    'NEW ARRIVALS', 'HATS & CAPS', 'T-SHIRTS', 'WALLETS', 'EYEWEAR',
    'BACKPACKS', 'JACKETS', 'HOODIES', 'SKATEBOARDS'
  ];

  // quick icon shortcuts (illustrative)
  shortcuts = [
    { id: 'hats', label: 'HATS & CAPS', icon: '🎩' },
    { id: 'tees', label: 'TSHIRTS', icon: '👕' },
    { id: 'wallets', label: 'WALLETS', icon: '💼' },
    { id: 'eyewear', label: 'EYEWEAR', icon: '🕶️' },
    { id: 'shirts', label: 'SHIRTS', icon: '👔' },
    { id: 'bottoms', label: 'BOTTOMS', icon: '👖' },
    { id: 'acc', label: 'ACCESSORIES', icon: '🧷' },
    { id: 'backs', label: 'BACKPACK', icon: '🎒' },
    { id: 'skate', label: 'SKATEBOARDS', icon: '🛹' }
  ];

  // sample products; replace img paths with your assets
  products: Product[] = [
    { id:1, title:'PLATED LONG SHIRT // 001', price:'RS.1850', img:'assets/images/product1.jpg', badge:'NEW ARRIVAL', tags:['T-SHIRTS','NEW ARRIVALS'] },
    { id:2, title:'UM SHADOW OPS', price:'RS.1850', img:'assets/images/product2.jpg', badge:'NEW ARRIVAL', tags:['BACKPACKS','NEW ARRIVALS'] },
    { id:3, title:'SHADOW PACK', price:'RS.1250', img:'assets/images/product3.jpg', badge:'NEW ARRIVAL', tags:['ACCESSORIES','NEW ARRIVALS'] },
    { id:4, title:'CORE WALLET // 001', price:'RS.1350', img:'assets/images/product4.jpg', badge:'NEW ARRIVAL', tags:['WALLETS','NEW ARRIVALS'] },
    { id:5, title:'VINTAGE DENIM', price:'RS.2450', img:'assets/images/product5.jpg', tags:['BOTTOMS'] },
    { id:6, title:'SUN GLASSES', price:'RS.950', img:'assets/images/product6.jpg', tags:['EYEWEAR'] },
    { id:7, title:'PLATED LONG SHIRT // 001', price:'RS.1850', img:'assets/images/product1.jpg', badge:'NEW ARRIVAL', tags:['T-SHIRTS','NEW ARRIVALS'] },
    { id:8, title:'UM SHADOW OPS', price:'RS.1850', img:'assets/images/product2.jpg', badge:'NEW ARRIVAL', tags:['BACKPACKS','NEW ARRIVALS'] },
    { id:9, title:'SHADOW PACK', price:'RS.1250', img:'assets/images/product3.jpg', badge:'NEW ARRIVAL', tags:['ACCESSORIES','NEW ARRIVALS'] },
    { id:10, title:'CORE WALLET // 001', price:'RS.1350', img:'assets/images/product4.jpg', badge:'NEW ARRIVAL', tags:['WALLETS','NEW ARRIVALS'] },
    { id:11, title:'VINTAGE DENIM', price:'RS.2450', img:'assets/images/product5.jpg', tags:['BOTTOMS'] },
    { id:12, title:'SUN GLASSES', price:'RS.950', img:'assets/images/product6.jpg', tags:['EYEWEAR'] },
    { id:7, title:'PLATED LONG SHIRT // 001', price:'RS.1850', img:'assets/images/product1.jpg', badge:'NEW ARRIVAL', tags:['T-SHIRTS','NEW ARRIVALS'] },
    { id:8, title:'UM SHADOW OPS', price:'RS.1850', img:'assets/images/product2.jpg', badge:'NEW ARRIVAL', tags:['BACKPACKS','NEW ARRIVALS'] },
    { id:9, title:'SHADOW PACK', price:'RS.1250', img:'assets/images/product3.jpg', badge:'NEW ARRIVAL', tags:['ACCESSORIES','NEW ARRIVALS'] },
    { id:10, title:'CORE WALLET // 001', price:'RS.1350', img:'assets/images/product4.jpg', badge:'NEW ARRIVAL', tags:['WALLETS','NEW ARRIVALS'] },
    { id:11, title:'VINTAGE DENIM', price:'RS.2450', img:'assets/images/product5.jpg', tags:['BOTTOMS'] },
    { id:12, title:'SUN GLASSES', price:'RS.950', img:'assets/images/product6.jpg', tags:['EYEWEAR'] }
  ];

  // UI state
  activeCategory = 'NEW ARRIVALS';
  searchQuery = '';

  // computed filtered list
  get filteredProducts(): Product[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.products.filter(p => {
      // filter by category (if category is 'NEW ARRIVALS', show items with that tag or badge)
      const matchesCategory =
        this.activeCategory === 'NEW ARRIVALS'
          ? (p.badge === 'NEW ARRIVAL' || (p.tags || []).includes('NEW ARRIVALS'))
          : (p.tags || []).map(t => t.toUpperCase()).includes(this.activeCategory.toUpperCase());

      // filter by search query if present
      const matchesQuery = !q || p.title.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }

  // change filter when chip clicked
  setCategory(cat: string) {
    this.activeCategory = cat;
  }

  // toggle wishlist heart
  toggleFavorite(p: Product, ev?: Event) {
    if (ev) ev.stopPropagation();
    p.favorite = !p.favorite;
  }

  // view single product or collection
  openProduct(p: Product) {
    // navigate to product page (update route as needed)
    this.router.navigate(['/product', p.id]);
  }

  // view all button
  viewAll() {
    this.router.navigate(['/collections']);
  }
}
