import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FavoriteCarButton } from '../favorite-car-button/favorite-car-button';
import { Car } from '../services/car';

@Component({
  selector: 'app-upcoming-car',
  imports: [CommonModule],
  templateUrl: './upcoming-car.html',
  styleUrl: './upcoming-car.css'
})
export class UpcomingCar implements OnInit{
upcomingCars: Car[] = [];

  constructor(private carService: Car) {}

  ngOnInit(): void {
    this.carService.getUpcomingCars().subscribe(
      (data) => {
        this.upcomingCars = data;
      },
      (error) => {
        console.error('Error fetching upcoming cars:', error);
      }
    );
  }

}
