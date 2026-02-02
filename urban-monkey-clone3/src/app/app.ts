import { Component } from '@angular/core';
import { Header } from './shared/header/header';
import { Navbar } from "./shared/navbar/navbar";
import { Footer } from "./shared/footer/footer";
import { LastSale } from './home/last-sale/last-sale';
import { GridScroll } from "./shared/grid-scroll/grid-scroll";
import { Reviews } from "./shared/reviews/reviews";
import { CategoryGrid } from "./home/category-grid/category-grid";
import { HeroBanner } from "./home/hero-banner/hero-banner";
import { HeroVariant } from "./home/hero-variant/hero-variant";
import { HeroSlider } from "./home/hero-slider/hero-slider";
import { ProductGrid } from "./home/product-grid/product-grid";
import { MarqueeHeader } from "./marquee-header/marquee-header";
import { LastSaleComponent } from "./last-sale/last-sale";
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-root',
  imports: [Header, Navbar, Footer, LastSale, GridScroll, Reviews, CategoryGrid, HeroBanner, HeroVariant, HeroSlider, ProductGrid, MarqueeHeader, LastSaleComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'urban-monkey-clone3';
}
