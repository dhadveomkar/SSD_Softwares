import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import * as XLSX from 'xlsx';
import { AuthService } from '../../../auth/authservice';

@Component({
  selector: 'app-child-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './child-header.component.html',
  styleUrl: './child-header.component.css'
})

export class ChildHeaderComponent {
  pageTitle: string = '';
  isLoginPage = false;
  userRole: string = 'User'; // Default to most restrictive role
  menuOpen: boolean = false; // Hamburger menu state
  openSubMenu: string | null = null; // Submenu state

  authService = inject(AuthService);

  constructor(private router: Router, private _eref: ElementRef) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEnd = event as NavigationEnd;
        this.isLoginPage = navEnd.url === '/login-page' || navEnd.url === '/';
        // console.log('URL:', navEnd.url, 'isLoginPage:', this.isLoginPage);
      });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.menuOpen && !this._eref.nativeElement.contains(event.target)) {
      this.menuOpen = false;
      this.openSubMenu = null;
    }
  }

  // Toggle menu dropdown
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (!this.menuOpen) {
      this.openSubMenu = null;
    }
  }

  // Toggle nested submenu


  toggleSubMenu(menu: string) {
    if (this.openSubMenu === menu) {
      this.openSubMenu = null;
    } else {
      this.openSubMenu = menu;
    }
  }


  get isAdmin(): boolean {
    const role = sessionStorage.getItem('userRole') || '';
    return role.toLowerCase() === 'admin';
  }

  get isRegularUser(): boolean {
    const role = sessionStorage.getItem('userRole') || '';
    return role.toLowerCase() === 'user';
  }
  ngOnInit() {

    this.userRole = sessionStorage.getItem('userRole') || 'abc'; 
    console.log('User Role:', this.userRole);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.pageTitle = this.getPageTitle(url);
    });

  }

  getPageTitle(url: string): string {
    if (url.includes('create-page')) return 'Create Employee';
    if (url.includes('employee-list')) return 'View Employee';
    if (url.includes('attandance-page')) return 'Attend Attendance';
    if (url.includes('manager-attandance-page')) return 'Approve Attandance';
    if (url.includes('leave-page')) return 'Leave Request';
    if (url.includes('leave-approve-page')) return 'Approve Leave';
    if (url.includes('report')) return 'Report Page';
    return '';
  }

  dashboard(event: Event) {
  event.preventDefault(); // prevent page reload
  // Add a timestamp query param to force reload
  this.router.navigate(['/create-page'], { queryParams: { t: Date.now() } });
  }
  EmployeeList(event: Event) {
    event.preventDefault(); // prevent page reload

    // Optional: clear session or local storage
    // sessionStorage.clear();

    // Navigate to login page
    this.router.navigate(['/employee-list']);
  }


  userAttandance(event: Event) {
    event.preventDefault(); // prevent page reload

    // Optional: clear session or local storage
    // sessionStorage.clear();

    // Navigate to login page
    this.router.navigate(['attandance-page']);
  }
  managerAttandance(event: Event) {
    event.preventDefault(); // prevent page reload

    // Optional: clear session or local storage
    // sessionStorage.clear();

    // Navigate to login page
    this.router.navigate(['/manager-attandance-page']);
  }

  userLeave(event: Event) {
    event.preventDefault(); // prevent page reload

    // Optional: clear session or local storage
    // sessionStorage.clear();

    // Navigate to login page
    this.router.navigate(['leave-page']);
  }
  managerLeave(event: Event) {
    event.preventDefault(); // prevent page reload

    // Optional: clear session or local storage
    // sessionStorage.clear();

    // Navigate to login page
    this.router.navigate(['/leave-approve-page']);
  }

  userTask(event: Event) {
    event.preventDefault(); // prevent page reload
    this.router.navigate(['task-page']);
  }
  managerTask(event: Event) {
    event.preventDefault(); // prevent page reload
    this.router.navigate(['/task-approve-page']);
  }

  holidayCalendar(event: Event) {
    event.preventDefault();
    this.router.navigate(['/holiday-calendar']);
  }

  createHoliday(event: Event) {
    event.preventDefault(); // prevent page reload
    this.router.navigate(['/create-holiday']);
  }

  logout(event: Event) {
    event.preventDefault(); // prevent page reload

    // Optional: clear session or local storage
    // sessionStorage.clear();

    // Navigate to login page
    this.router.navigate(['/login-page']);
  }

  report(event: Event) {
    event.preventDefault(); // prevent page reload

    // Navigate to login page
    this.router.navigate(['/report-page']);
  }

  timeSheet(event: Event) {
    event.preventDefault();

    const reportData = [
      { Name: 'John', Hours: 8, Status: 'Present' },
    ];

    // Correct way to convert JSON to CSV
    const ws = XLSX.utils.json_to_sheet(reportData);  // First convert to worksheet
    const csv = XLSX.utils.sheet_to_csv(ws);          // Then convert worksheet to CSV

    const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvBlob);

    // Open in Google Sheets
    window.open(`https://docs.google.com/spreadsheets/create?usp=import_flow&ths=true&importData=${encodeURIComponent(csvUrl)}`, '_blank');
  }

  AttandancePage(event: Event) {
    event.preventDefault(); 
    this.router.navigate(['/attandance-page']);
  }
  LeavePage(event: Event) {
    event.preventDefault(); 
    this.router.navigate(['/leave-page']);
  }
}
