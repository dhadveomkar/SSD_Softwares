import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-banner',
  imports: [],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner {
// Pass the image URL from the parent component (e.g., Home Page)
  @Input() src: string = '';
  @Input() alt: string = 'Promotional Banner';
}
