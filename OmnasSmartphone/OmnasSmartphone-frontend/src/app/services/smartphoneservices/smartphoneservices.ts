import { HttpClient } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Smartphonemodels } from '../../models/smartphonemodels/smartphonemodels';

@Component({
  selector: 'app-smartphoneservices',
  imports: [],
  templateUrl: './smartphoneservices.html',
  styleUrl: './smartphoneservices.css',
})
@Injectable({ providedIn: 'root' })
export class Smartphoneservices {
private apiUrl = 'http://localhost:8080/api/v1/smartphones';

  constructor(private http: HttpClient) {}

  getSmartphones(): Observable<Smartphonemodels[]> {
    return this.http.get<Smartphonemodels[]>(this.apiUrl);
  }
}
