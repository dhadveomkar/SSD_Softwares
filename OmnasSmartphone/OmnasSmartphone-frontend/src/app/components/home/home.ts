import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Smartphoneservices } from '../../services/smartphoneservices/smartphoneservices';
import { Smartphonemodels } from '../../models/smartphonemodels/smartphonemodels';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  allPhones: Smartphonemodels[] = [];
  filteredPhones: Smartphonemodels[] = [];
  searchControl = new FormControl('');
  selectedPhone: Smartphonemodels | null = null;
  router: any;

  constructor(
    private Smartphoneservices: Smartphoneservices,
    private cdr: ChangeDetectorRef // Helps with UI refresh on browser reload
  ) {}

  ngOnInit(): void {
    // 1. Fetch Data immediately
    this.fetchData();

    // 2. Setup Search listener
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterData(value || '');
      // Re-check visibility after filtering
      setTimeout(() => this.handleScroll(), 50);
    });

    // 3. Setup Scroll listener
    // Using an arrow function keeps 'this' pointing to the class
    window.addEventListener('scroll', this.handleScroll);
  }

  fetchData() {
    this.Smartphoneservices.getSmartphones().subscribe({
      next: (data) => {
        this.allPhones = data;
        this.filteredPhones = data;
        
        // Tells Angular to detect changes immediately
        this.cdr.detectChanges();

        // Wait for the DOM to catch up, then show elements
        setTimeout(() => {
          this.handleScroll(); 
        }, 200); 
      },
      error: (err) => console.error('API Error:', err)
    });
  }

  // Optimized Scroll Logic
  handleScroll = () => {
    const sections = document.querySelectorAll('section');
    sections.forEach((sec) => {
      const htmlSec = sec as HTMLElement;
      const rect = htmlSec.getBoundingClientRect();
      
      // If the top of the section is visible in the viewport
      const isVisible = rect.top <= window.innerHeight - 100;
      
      if (isVisible) {
        htmlSec.classList.add('visible');
      }
    });
  }

  filterData(term: string) {
    this.filteredPhones = this.allPhones.filter(phone =>
      phone.brand.toLowerCase().includes(term.toLowerCase()) ||
      phone.model.toLowerCase().includes(term.toLowerCase()) ||
      phone.processor.toLowerCase().includes(term.toLowerCase())
    );
  }

  openDetails(phone: Smartphonemodels) {
    this.selectedPhone = phone;
    document.body.style.overflow = 'hidden';
  }

  closeDetails() {
    this.selectedPhone = null;
    document.body.style.overflow = 'auto';
  }

  // Cleanup when navigating away
  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.handleScroll);
  }

  // Logic to open Reviews in a NEW TAB
goToReviews(phoneId: number) {
  const url = this.router.serializeUrl(
    this.router.createUrlTree(['/reviews', phoneId])
  );
  window.open(url, '_blank');
}
}