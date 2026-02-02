import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Card {
  id: number;
  name: string;
  subtitle: string;
  wearing: string;
  img: string;
}

@Component({
  selector: 'app-grid-scroll',
  imports: [CommonModule, FormsModule],
  templateUrl: './grid-scroll.html',
  styleUrl: './grid-scroll.css',
})
export class GridScroll implements AfterViewInit {

  @ViewChild('scroller') scroller!: ElementRef;

  showLeft = false;
  showRight = true;

  cards = [
    { img: '/Katrina_kaif.png', name: 'KATRINA KAIF', subtitle: 'INDIAN ACTRESS', wearing: 'ILLUMINATI' },
    { img: '/Raftaar.png', name: 'Red Cap', subtitle: 'Street Vibes', wearing: 'Urban Style' },
    { img: '/Panther.png', name: 'Yellow Cap', subtitle: 'Trendy Fit', wearing: 'Casual Wear' },
    { img: '/Shanaya_Kapoor.png', name: 'Green Cap', subtitle: 'Daily Classic', wearing: 'Styled Daily' },
    { img: '/MC_Stan.png', name: 'White Cap', subtitle: 'Classic',   wearing: 'Minimal Look' },
    { img: '/Nora_fatehi.png', name: 'Black Cap', subtitle: 'Limited Edition', wearing: 'On heads everywhere' },
    { img: '/Siddharth_Malhotra.png', name: 'Red Cap', subtitle: 'Street Vibes', wearing: 'Urban Style' },
    { img: '/Raftaar_04.png', name: 'Yellow Cap', subtitle: 'Trendy Fit', wearing: 'Casual Wear' },
    { img: '/Ishant_Sharma.png', name: 'Green Cap', subtitle: 'Daily Classic', wearing: 'Styled Daily' },
    { img: '/Huma_Qureshi_02.png', name: 'White Cap', subtitle: 'Classic',   wearing: 'Minimal Look' },
    { img: '/Badshah.png', name: 'Black Cap', subtitle: 'Limited Edition', wearing: 'On heads everywhere' },
    { img: '/Sunny_Kaushal.png', name: 'Red Cap', subtitle: 'Street Vibes', wearing: 'Urban Style' },
    { img: '/Arshad_Warsi.png', name: 'Yellow Cap', subtitle: 'Trendy Fit', wearing: 'Casual Wear' },
    { img: '/MC_Stan_02.png', name: 'Green Cap', subtitle: 'Daily Classic', wearing: 'Styled Daily' },
    { img: '/Akshay_Kumar.png', name: 'White Cap', subtitle: 'Classic',   wearing: 'Minimal Look' },
    { img: '/D_Evil.png', name: 'Black Cap', subtitle: 'Limited Edition', wearing: 'On heads everywhere' }
    
  ];
https: any;

  ngAfterViewInit() {
    this.updateArrows();
  }

  scrollLeft() {
    this.scroller.nativeElement.scrollBy({ left: -260, behavior: 'smooth' });
    setTimeout(() => this.updateArrows(), 400);
  }

  scrollRight() {
    this.scroller.nativeElement.scrollBy({ left: 260, behavior: 'smooth' });
    setTimeout(() => this.updateArrows(), 400);
  }

  updateArrows() {
    const el = this.scroller.nativeElement;

    this.showLeft = el.scrollLeft > 10;
    this.showRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 10;
  }

  @HostListener('window:resize')
  onResize() {
    this.updateArrows();
  }
}


