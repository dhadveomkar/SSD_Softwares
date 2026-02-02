import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-brand-card',
  imports: [CommonModule],
  templateUrl: './brand-card.html',
  styleUrl: './brand-card.css'
})
export class BrandCard {
@Input() brandName: string = '';
  @Input() brandLogo: string = ''; // e.g. 'assets/logos/hyundai.png'
}
