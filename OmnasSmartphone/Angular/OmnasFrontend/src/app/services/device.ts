import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SmartphoneDevice } from '../models/device.model';


@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private apiUrl = 'https://localhost:7172/api/SmartphoneDevices';

  constructor(private http: HttpClient) { }

  getDevices(): Observable<SmartphoneDevice[]> {
    return this.http.get<SmartphoneDevice[]>(this.apiUrl);
  }

  addDevice(device: SmartphoneDevice): Observable<SmartphoneDevice> {
    return this.http.post<SmartphoneDevice>(this.apiUrl, device);
  }
}
