import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ToastModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  constructor(private router: Router) {}

}
