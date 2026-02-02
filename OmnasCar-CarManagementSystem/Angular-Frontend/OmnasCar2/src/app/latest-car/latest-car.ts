import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FavoriteCarButton } from '../favorite-car-button/favorite-car-button';
import { Car } from '../services/car';

@Component({
  selector: 'app-latest-car',
  imports: [CommonModule],
  templateUrl: './latest-car.html',
  styleUrl: './latest-car.css'
})
export class LatestCar implements OnInit{
latestCars: Car[] = [];

  constructor(private carService: Car) {}

  ngOnInit(): void {
    this.carService.getLatestCars().subscribe(
      (data) => {
        this.latestCars = data;
      },
      (error) => {
        console.error('Error fetching latest cars:', error);
      }
    );
  }

  
}
