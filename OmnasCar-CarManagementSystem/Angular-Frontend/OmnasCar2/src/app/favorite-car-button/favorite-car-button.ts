import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-favorite-car-button',
  imports: [CommonModule],
  templateUrl: './favorite-car-button.html',
  styleUrl: './favorite-car-button.css'
})
export class FavoriteCarButton {
@Input() isFavorite: boolean = false;
  @Output() toggleFavorite = new EventEmitter<boolean>();

  toggle() {
    this.isFavorite = !this.isFavorite;
    this.toggleFavorite.emit(this.isFavorite);
  }
}
