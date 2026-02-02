import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../models/product';
import { ProductService } from '../services/product.service';

type SortKey =
  | 'availability'
  | 'best-selling'
  | 'alpha-asc'
  | 'alpha-desc'
  | 'date-new'
  | 'date-old'
  | 'price-asc'
  | 'price-desc'
  | 'sale-off';

@Component({
  selector: 'app-last-sale1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './last-sale.html',
  styleUrls: ['./last-sale.css']
})
export class LastSaleComponent {
  allProducts: Product[] = [];
  displayedProducts: Product[] = [];

  // UI state
  filterOpen = false;
  query = '';
  sortBy: SortKey = 'best-selling';

  // multi-select filters
  categories: string[] = [];
  selectedCategories: string[] = [];

  colors: string[] = [];
  selectedColors: string[] = [];

  materials: string[] = [];
  selectedMaterials: string[] = [];

  sizes: string[] = [];
  selectedSizes: string[] = [];

  ratings: number[] = [];
  selectedRatings: number[] = [];

  bestFor: string[] = [];
  selectedBestFor: string[] = [];

  frameSizes: string[] = [];
  selectedFrameSizes: string[] = [];

  frameTypes: string[] = [];
  selectedFrameTypes: string[] = [];

  frameStyles: string[] = [];
  selectedFrameStyles: string[] = [];

  minPrice: number | null = null;
  maxPrice: number | null = null;

  availability: 'all' | 'in' | 'out' = 'all';

  // pagination / load more
  visibleCount = 12;
  pageSize = 12;

  // favorites
  favorites = new Set<number>();

  constructor(private ps: ProductService) {
    this.loadFavoritesFromStorage();
    this.ps.getProducts().subscribe(p => {
      this.allProducts = p;
      // derive filter lists
      this.categories = Array.from(new Set(p.map(x => x.category || 'Other')));
      this.colors = Array.from(new Set(p.map(x => x.color || 'Other')));
      this.materials = Array.from(new Set(p.map(x => x.material || 'Other')));
      this.sizes = Array.from(new Set(p.map(x => x.size || 'Other')));
      this.ratings = Array.from(new Set(p.map(x => x.rating || 0))).filter(n => n>0).sort((a,b)=>b-a);
      // flatten bestFor arrays
      this.bestFor = Array.from(new Set(p.flatMap(x => x.bestFor || [])));
      this.frameSizes = Array.from(new Set(p.map(x => x.frameSize || ''))).filter(s=>s);
      this.frameTypes = Array.from(new Set(p.map(x => x.frameType || ''))).filter(s=>s);
      this.frameStyles = Array.from(new Set(p.map(x => x.frameStyle || ''))).filter(s=>s);

      this.applyFilters();
    });
  }

  private saveFavoritesToStorage() {
    localStorage.setItem('um_favs', JSON.stringify(Array.from(this.favorites)));
  }
  private loadFavoritesFromStorage() {
    try {
      const raw = localStorage.getItem('um_favs');
      if (raw) this.favorites = new Set(JSON.parse(raw));
    } catch { this.favorites = new Set(); }
  }

  toggleFavorite(id: number) {
    if (this.favorites.has(id)) this.favorites.delete(id);
    else this.favorites.add(id);
    this.saveFavoritesToStorage();
  }
  isFavorite(id: number) { return this.favorites.has(id); }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder.png';
  }

  /**
   * Generic helper used by checkbox handlers in template.
   * Example usage: (change)="toggleSelection(selectedCategories, c)"
   */
  toggleSelection<T>(list: T[], value: T): void {
    const idx = list.indexOf(value);
    if (idx === -1) list.push(value);
    else list.splice(idx, 1);
    this.applyFilters();
  }

  applyFilters() {
    let list = this.allProducts.slice();

    const q = this.query?.trim().toLowerCase();
    if (q) {
      list = list.filter(p => (p.name + ' ' + (p.subtitle || '')).toLowerCase().includes(q));
    }

    if (this.selectedCategories.length) list = list.filter(p => p.category && this.selectedCategories.includes(p.category));
    if (this.selectedColors.length) list = list.filter(p => p.color && this.selectedColors.includes(p.color));
    if (this.selectedMaterials.length) list = list.filter(p => p.material && this.selectedMaterials.includes(p.material));
    if (this.selectedSizes.length) list = list.filter(p => p.size && this.selectedSizes.includes(p.size));
    if (this.selectedRatings.length) list = list.filter(p => p.rating && this.selectedRatings.includes(p.rating));
    if (this.selectedBestFor.length) list = list.filter(p => (p.bestFor||[]).some(b => this.selectedBestFor.includes(b)));
    if (this.selectedFrameSizes.length) list = list.filter(p => p.frameSize && this.selectedFrameSizes.includes(p.frameSize));
    if (this.selectedFrameTypes.length) list = list.filter(p => p.frameType && this.selectedFrameTypes.includes(p.frameType));
    if (this.selectedFrameStyles.length) list = list.filter(p => p.frameStyle && this.selectedFrameStyles.includes(p.frameStyle));

    if (this.minPrice != null) {
      const min = Number(this.minPrice ?? 0);
      list = list.filter(p => p.price >= min);
    }
    if (this.maxPrice != null) {
      const max = Number(this.maxPrice ?? Infinity);
      list = list.filter(p => p.price <= max);
    }

    // availability
    if (this.availability === 'in') list = list.filter(p => p.inStock);
    if (this.availability === 'out') list = list.filter(p => !p.inStock);

    // sort
    list = this.sortProducts(list);

    this.displayedProducts = list;
    this.resetPagination();
  }

  sortProducts(list: Product[]): Product[] {
    switch (this.sortBy) {
      case 'availability': return list.sort((a,b)=> Number(b.inStock) - Number(a.inStock));
      case 'alpha-asc': return list.sort((a,b)=> a.name.localeCompare(b.name));
      case 'alpha-desc': return list.sort((a,b)=> b.name.localeCompare(a.name));
      case 'date-new': return list.sort((a,b)=> new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime());
      case 'date-old': return list.sort((a,b)=> new Date(a.createdAt||0).getTime() - new Date(b.createdAt||0).getTime());
      case 'price-asc': return list.sort((a,b)=> a.price - b.price);
      case 'price-desc': return list.sort((a,b)=> b.price - a.price);
      case 'sale-off':
        return list.sort((a,b)=>{
          const off = (x: Product) => ((x.oldPrice ?? x.price) - x.price) / (x.oldPrice ?? x.price);
          return off(b) - off(a);
        });
      default: return list;
    }
  }

  // pagination helpers
  loadMore() { this.visibleCount += this.pageSize; }
  resetPagination() { this.visibleCount = this.pageSize; }
  visibleProducts() { return this.displayedProducts.slice(0, this.visibleCount); }

  toggleFilterPanel() { this.filterOpen = !this.filterOpen; }

  viewProducts() {
    this.applyFilters();
    this.visibleCount = this.displayedProducts.length || this.pageSize;
    this.filterOpen = false;
    setTimeout(()=>{
      const el = document.querySelector('.product-area');
      if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
    }, 120);
  }

  clearFilters() {
    this.query = '';
    this.selectedCategories = [];
    this.selectedColors = [];
    this.selectedMaterials = [];
    this.selectedSizes = [];
    this.selectedRatings = [];
    this.selectedBestFor = [];
    this.selectedFrameSizes = [];
    this.selectedFrameTypes = [];
    this.selectedFrameStyles = [];
    this.minPrice = null;
    this.maxPrice = null;
    this.availability = 'all';
    this.sortBy = 'best-selling';
    this.applyFilters();
  }

  // compute discount percent safely for template
  discountPercent(p: Product): number {
    if (!p.oldPrice || p.oldPrice <= 0) return 0;
    return Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
  }

  trackById(index: number, item: Product) {
  return item.id;
}
}