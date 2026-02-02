import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface GridItem {
  title: string;
  subTitle: string;
  imageUrl: string;
}

@Component({
  selector: 'app-dealgrid',
  imports: [CommonModule, FormsModule],
  templateUrl: './dealgrid.html',
  styleUrl: './dealgrid.css',
})
export class Dealgrid {
@Input() sectionTitle: string = '';
  @Input() items: GridItem[] = [];
}
