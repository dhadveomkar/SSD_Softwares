import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChildHeaderComponent } from "./Common/child-header/child-header.component";
import { HeaderComponent } from "./Common/header/header.component";
import { LoginComponent } from "./Common/login/login.component";
import { EmployeeListComponent } from './Manager-pages/employee-list/employee-list.component';
import { SessionService } from './session-service/session-service.component';
 
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, LoginComponent, EmployeeListComponent, ChildHeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ems-portal';
  userRole: string | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,  private sessionService: SessionService) {
    this.getUserRole();
  }

  getUserRole() {
    if (isPlatformBrowser(this.platformId)) {
      this.userRole = sessionStorage.getItem('userRole');
      console.log('User role:', this.userRole);
    }
  }
  
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.sessionService.startSessionTimer();
    }
  }

}

