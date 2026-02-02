import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Car {
  id?: number;
  name: string;
  brand: string;
  type: string;
  price: number;
  latest: boolean;
  upcoming: boolean;
  electric: boolean;
}

@Component({
  selector: 'app-admin-car-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-car-management.html',
  styleUrl: './admin-car-management.css'
})
export class AdminCarManagement implements OnInit {
  cars: Car[] = [];
  newCar: Car = this.resetNewCar();
  editingCar: Car | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchCars();
  }

  fetchCars() {
  this.http.get<Car[]>('http://localhost:8080/api/cars/all')
    .subscribe(data => {
      this.cars = data;  // ✅ This must update the local array
    });
}


  addCar() {
  if (!this.newCar.name || !this.newCar.brand || !this.newCar.type || !this.newCar.price) {
    alert('Please fill all required fields.');
    return;
  }

  this.http.post<Car>('http://localhost:8080/api/cars/add', this.newCar)
    .subscribe({
      next: (addedCar) => {
        alert(`✅ Car "${addedCar.name}" added successfully!`);
        this.newCar = this.resetNewCar();
        this.fetchCars();
      },
      error: (err) => {
        console.error('Error adding car:', err);
        alert('❌ Failed to add car.');
      }
    });
}


  editCar(car: Car) {
    this.editingCar = { ...car };
  }

  updateCar() {
  if (
    !this.editingCar?.name ||
    !this.editingCar?.brand ||
    !this.editingCar?.type ||
    !this.editingCar?.price
  ) {
    alert('Please fill all required fields before saving.');
    return;
  }

  if (this.editingCar.id != null) {
    this.http.put<Car>(`http://localhost:8080/api/admin/cars/${this.editingCar.id}`, this.editingCar)
      .subscribe({
        next: () => {
          alert('✅ Car updated successfully!');
          this.editingCar = null;
          this.fetchCars();
        },
        error: (err) => {
          console.error('Error updating car:', err);
          alert('❌ Failed to update car.');
        }
      });
  }
}


  deleteCar(id: number | undefined) {
  if (!id) return;

  if (confirm('Are you sure you want to delete this car?')) {
    this.http.delete<{ message: string }>(`http://localhost:8080/api/cars/${id}`)
      .subscribe({
        next: (res) => {
          console.log(res.message); // ✅ "Car deleted successfully"
          alert(res.message);       // ✅ Optional: show to user
          this.fetchCars();         // ✅ Refresh car list
        },
        error: (err) => {
          console.error('Error deleting car:', err);
          alert(err.error?.error || 'Failed to delete car.');
        }
      });
  }
}



  cancelEdit() {
    this.editingCar = null;
  }

  resetNewCar(): Car {
    return {
      name: '',
      brand: '',
      type: '',
      price: 0,
      latest: false,
      upcoming: false,
      electric: false
    };
  }
}
