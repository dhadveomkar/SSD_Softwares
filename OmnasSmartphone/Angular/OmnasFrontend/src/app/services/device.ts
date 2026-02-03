// src/app/services/device.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SmartphoneDevice, TabletDevice, WearableDevice } from '../models/device.model';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private baseUrl = 'https://localhost:7172/api/Inventory';

  constructor(private http: HttpClient) { }

  // Fetches all data in one go from [HttpGet("live-data")]
  getCombinedInventory(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/live-data`);
  }

  // Fetches by category using your [HttpGet("filter")]
  getDevicesByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/filter?category=${category}`);
  }
}