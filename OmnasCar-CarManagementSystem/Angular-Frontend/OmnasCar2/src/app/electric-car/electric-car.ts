import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Car } from '../services/car'; // ✅ Make sure it's a service, not interface
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-electric-car',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './electric-car.html',
  styleUrl: './electric-car.css'
})
export class ElectricCar implements OnInit {
  electricCars: any[] = [];

  constructor(private carService: Car) {}

  ngOnInit(): void {
    this.carService.getElectricCars().subscribe({
      next: (data) => this.electricCars = data,
      error: (err) => console.error('Error fetching electric cars:', err)
    });
  }
}
