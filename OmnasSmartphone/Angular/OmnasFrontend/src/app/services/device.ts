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
  // Inside device.service.ts
getAllDevices(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/all`);
}

  // Fetches by category using your [HttpGet("filter")]
  getDevicesByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/filter?category=${category}`);
  }

  // src/app/services/device.service.ts
addDevice(category: string, device: any): Observable<any> {
  // We can use your existing filter endpoint logic or create a dedicated POST endpoint
  return this.http.post(`${this.baseUrl}/add?category=${category}`, device);
}

updateDevice(category: string, id: number, device: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/update/${category}/${id}`, device);
}

deleteDevice(category: string, id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/delete/${category}/${id}`);
}
}