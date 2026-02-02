import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Car {
  id?: number;
  name: string;
  brand: string;
  type: string;
  price: number;
  latest: boolean;
  upcoming: boolean;
  electric: boolean;
  
}

@Injectable({
  providedIn: 'root'
})
export class Car {

  private baseUrl = 'http://localhost:8080/api/cars';

  constructor(private http: HttpClient) {}

  // Get all cars
  getAllCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.baseUrl}/all`);
  }

  // Get car by ID
  getCarById(id: number): Observable<Car> {
    return this.http.get<Car>(`${this.baseUrl}/${id}`);
  }

  // Get latest cars
  getLatestCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.baseUrl}/latest`);
  }

  // Get upcoming cars
  getUpcomingCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.baseUrl}/upcoming`);
  }

  // Get electric cars
  getElectricCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.baseUrl}/electric`);
  }

  // Filter by brand
  getByBrand(brand: string): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.baseUrl}/brand?brand=${brand}`);
  }

  // Filter by price range
  getByPriceRange(min: number, max: number): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.baseUrl}/price?min=${min}&max=${max}`);
  }

  // Add new car
  addCar(car: Car): Observable<Car> {
    return this.http.post<Car>(`${this.baseUrl}/add`, car);
  }

  // Update car
  updateCar(id: number, car: Car): Observable<Car> {
    return this.http.put<Car>(`${this.baseUrl}/${id}`, car);
  }

  // Delete car
  deleteCar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }
}
