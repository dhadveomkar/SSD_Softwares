import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Car } from '../services/car';

@Component({
  selector: 'app-view-all-cars',
  imports: [CommonModule],
  templateUrl: './view-all-cars.html',
  styleUrl: './view-all-cars.css'
})
export class ViewAllCars implements OnInit{
latestCars: Car[] = [];
  upcomingCars: Car[] = [];
  electricCars: Car[] = [];

  constructor(private carService: Car) {}

  ngOnInit(): void {
    this.carService.getLatestCars().subscribe(data => this.latestCars = data);
    this.carService.getUpcomingCars().subscribe(data => this.upcomingCars = data);
    this.carService.getElectricCars().subscribe(data => this.electricCars = data);
  }
}
