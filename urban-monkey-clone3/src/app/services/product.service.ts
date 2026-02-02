import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private products: Product[] = [
    { id: 1, name: 'Stash Pocket Snapback', subtitle: 'Black', img: '/stash-pocket-snapback-black-24s195-blk-886907.png', category: 'Hats & Caps', color: 'Black', material: 'Cotton', size: 'L', rating: 4, bestFor: ['Casual'], frameSize: '', frameType: '', frameStyle: '', price: 999, oldPrice: 1500, inStock: true, createdAt: '2025-07-01' },
    { id: 2, name: 'Screen Time 001', subtitle: 'Clear Lens', img: '/screen-time-001-2281-c2-632969.png', category: 'Eyewear', color: 'Clear', material: 'Plastic', size: 'M', rating: 5, bestFor: ['Lifestyle'], frameSize: 'MEDIUM', frameType: 'EYEGLASSES', frameStyle: 'RECTANGLE', price: 1799, oldPrice: 1999, inStock: true, createdAt: '2025-06-10' },
    { id: 3, name: 'Old School 002', subtitle: 'Black', img: '/old-school-002-ld202-c01-700092.png', category: 'Eyewear', color: 'Black', material: 'Wool', size: 'M', rating: 3, bestFor: ['Music'], frameSize: '', frameType: '', frameStyle: '', price: 1099, oldPrice: 1500, inStock: false, createdAt: '2025-05-20' },
    { id: 4, name: 'Military Monkey', subtitle: 'Camo', img: '/military-monkey-um22bc-004-501536.png', category: 'Hats & Caps', color: 'Camo', material: 'Canvas', size: 'L', rating: 4, bestFor: ['Adventure','Hiking'], frameSize: '', frameType: '', frameStyle: '', price: 999, oldPrice: 1250, inStock: true, createdAt: '2025-05-28' },
    { id: 5, name: 'Vintage Loop Sunglasses', subtitle: 'Brown Lens', img: '/vintage-punk-007-s31441-c106-197543_360x.png', category: 'Sunglasses', color: 'Brown', material: 'Metal', size: 'M', rating: 5, bestFor: ['Casual','Music'], frameSize: 'MEDIUM', frameType: 'SUNGLASSES', frameStyle: 'RECTANGLE', price: 1599, oldPrice: 1999, inStock: true, createdAt: '2025-07-08' },
    { id: 6, name: 'Minimal Wallet', subtitle: 'Tan', img: '/wallet-011-rhw001-sl04-962215_360x.png', category: 'Accessories', color: 'Tan', material: 'Leather', size: '', rating: 4, bestFor: ['Lifestyle'], frameSize: '', frameType: '', frameStyle: '', price: 699, oldPrice: 999, inStock: true, createdAt: '2025-04-01' }
    
  ];

  getProducts(): Observable<Product[]> {
    return of(this.products);
  }
}
