import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { filter } from 'rxjs';
import { ApiService, LeaveNotificationService } from '../../../services/services';
import { ChildHeaderComponent } from '../child-header/child-header.component';
import { ProfilePageComponent } from '../profile-page/profile-page.component';
 
 
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ChildHeaderComponent, ProfilePageComponent, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  allRequests: any[] = [];
  filteredRequests: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  adminLeaveRequestCount: number = 0;
  managerLeaveRequestCount: number = 0;
  currentRoleName: string = '';
 
 
  AdminLeaveRequestCount(filteredData: any[]) {
    const pending = filteredData.filter((req: any) => req.status === 'Pending');
    this.adminLeaveRequestCount = pending.length;
    this.pendingLeaveCount = pending.length;
    this.leaveNotificationService.setAdminPendingCount(this.adminLeaveRequestCount);
  }
 
  ManagerLeaveRequestCount(filteredData: any[]) {
    const pending = filteredData.filter((req: any) => req.status === 'Pending');
    this.managerLeaveRequestCount = pending.length;
    this.pendingLeaveCount = pending.length;
    this.leaveNotificationService.setManagerPendingCount(this.managerLeaveRequestCount);
  }
 
  fetchLeaveRequestsForAdmin() {
    this.isLoading = true;
    this.errorMessage = '';
    const adminEmpId = sessionStorage.getItem('empId');
    if (!adminEmpId) {
      this.errorMessage = 'Admin ID not found.';
      this.isLoading = false;
      return;
    }
    this.apiService.getAllUsers().subscribe({
      next: (users: any[]) => {
        // Find managers under this admin
        const managerEmpIds = users
          .filter(user => user.managerId === adminEmpId)
          .map(user => user.empId);
        // Find employees under each manager
        const employeeEmpIds = users
          .filter(user => managerEmpIds.includes(user.managerId))
          .map(user => user.empId);
        // Combine manager, employee, and admin empIds
        const allEmpIds = [...managerEmpIds, ...employeeEmpIds, adminEmpId];
        this.apiService.getAllLeaveRequests().subscribe({
          next: (data: any[]) => {
            const filteredData = data.filter(request => allEmpIds.includes(request.empId));
            this.allRequests = filteredData;
            this.filteredRequests = filteredData;
            this.isLoading = false;
            this.AdminLeaveRequestCount(filteredData);
          },
          error: (err) => {
            console.error('Error fetching leave requests:', err);
            this.errorMessage = 'Failed to load leave requests.';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.errorMessage = 'Failed to load user data.';
        this.isLoading = false;
      }
    });
  }
 
  fetchLeaveRequestsForManager() {
    this.isLoading = true;
    this.errorMessage = '';
    const managerEmpId = sessionStorage.getItem('empId');
    if (!managerEmpId) {
      this.errorMessage = 'Manager ID not found.';
      this.isLoading = false;
      return;
    }
    this.apiService.getAllUsers().subscribe({
      next: (users: any[]) => {
        const managedEmpIds = users
          .filter(user => user.managerId === managerEmpId)
          .map(user => user.empId);
        if (managedEmpIds.length === 0) {
          this.allRequests = [];
          this.filteredRequests = [];
          this.isLoading = false;
          return;
        }
        this.apiService.getAllLeaveRequests().subscribe({
          next: (data: any[]) => {
            const filteredData = data.filter(request => managedEmpIds.includes(request.empId));
            this.allRequests = filteredData;
            this.filteredRequests = filteredData;
            this.isLoading = false;
            this.ManagerLeaveRequestCount(filteredData);
          },
          error: (err) => {
            console.error('Error fetching leave requests:', err);
            this.errorMessage = 'Failed to load leave requests.';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.errorMessage = 'Failed to load user data.';
        this.isLoading = false;
      }
    });
  }
  goToLeaveApprovalPage() {
    this.router.navigate(['/leave-approve-page']);
    this.showNotificationDropdown = false;
  }
  pendingLeaveCount: number = 0;
  private leaveNotificationService = inject(LeaveNotificationService);
  showProfileMenu = false;
  isLoginPage = false;
  pageTitle: string = '';
  pagePath: string = '';
  currentDate: string = '';
  userInitial: string = '';
  // Hamburger menu logic
  menuOpen: boolean = false;
  openSubMenu: string | null = null;
  private removeClickListener: (() => void) | null = null;
  private removeMenuClickListener: (() => void) | null = null;
  private router = inject(Router);
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
 
  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEnd = event as NavigationEnd;
        // Hide header for any route containing 'login'
        this.isLoginPage = navEnd.url.toLowerCase().includes('login');
 
        // Update role and notification after navigation (e.g., after login)
        this.updateRoleAndNotifications();
      });
  }
 
  private updateRoleAndNotifications() {
    // Re-initialize role when navigating (especially after login)
    this.initializeRole();
  }
 
  showToastSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message
    });
  }
 
 
  showToastError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }
 
  ngOnInit() {
    // Set currentRoleName immediately from sessionStorage for instant display
    this.initializeRole();
 
    // Subscribe to both admin and manager pending leave count updates
    this.leaveNotificationService.adminPendingCount$.subscribe(count => {
      if (this.currentRoleName.toLowerCase() === 'admin') {
        this.pendingLeaveCount = count;
      }
    });
    this.leaveNotificationService.managerPendingCount$.subscribe(count => {
      if (this.currentRoleName.toLowerCase() === 'manager') {
        this.pendingLeaveCount = count;
      }
    });
 
    // Update page title and user initial on every route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.pageTitle = this.getPageTitle(url);
      this.pagePath = this.getPagePath(url);
      // Update userInitial on every route change
      const userName = sessionStorage.getItem('userName') || '';
      this.userInitial = userName ? userName.charAt(0).toUpperCase() : '';
    });
    this.updateDate();
    setInterval(() => {
      this.updateDate();
    }, 1000);
  }
 
  private initializeRole() {
    // Set currentRoleName immediately from sessionStorage for instant display
    const userRoleFromSession = (sessionStorage.getItem('userRole') || '').toLowerCase();
    if (userRoleFromSession) {
      this.currentRoleName = sessionStorage.getItem('userRole') || '';
      console.log('Role loaded from sessionStorage:', this.currentRoleName);
    }
 
    // Call getAllRoles API, match roleId from sessionStorage, and store RoleName for access control
    this.apiService.getAllRoles().subscribe({
      next: (response: any[]) => {
        const roleIdStr = sessionStorage.getItem('roleId');
        if (roleIdStr) {
          const roleId = parseInt(roleIdStr, 10);
          const matchedRole = response.find(r => r.roleId === roleId);
          if (matchedRole) {
            this.currentRoleName = matchedRole.roleName;
            console.log('Matched Role:', matchedRole.roleName);
          } else {
            this.currentRoleName = '';
            console.log('No matching role found for roleId:', roleId);
          }
        } else {
          this.currentRoleName = '';
          console.log('No roleId found in sessionStorage');
        }
      },
      error: (err: any) => {
        console.error('getAllRoles API Error:', err);
      }
    });
 
    // Fetch and show pending leave count for admin/manager in notification
    const currentUserRole = (sessionStorage.getItem('userRole') || '').toLowerCase();
 
    if (currentUserRole === 'admin') {
      this.fetchLeaveRequestsForAdmin();
    } else if (currentUserRole === 'manager') {
      this.fetchLeaveRequestsForManager();
    }
 
    //  Show icon only for admin or manager
    this.showNotificationIcon = ['admin', 'manager'].includes(currentUserRole);
  }
 
  updateDate() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // last two digits
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    this.currentDate = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  }
 
  getPageTitle(url: string): string {
    if (url.includes('create-page')) return 'Create Employee';
    if (url.includes('employee-list')) return 'View Employee';
    if (url.includes('attandance-page')) return 'Attend Attendance';
    if (url.includes('manager-attandance-page')) return 'Approve Attandance';
    if (url.includes('leave-page')) return 'Leave Request';
    if (url.includes('leave-approve-page')) return 'Approve Leave';
    if (url.includes('report')) return 'Report Page';
    if (url.includes('profile-page')) return 'My Profile';
    if (url.includes('task-page')) return 'Task Details';
    if (url.includes('task-approve-page')) return 'Approve Task';
    if (url.includes('weekly-timesheet')) return 'Weekly Timesheet';
    return '';
  }
 
  //Name-Vaibhav Kotkar
  //Details: Function to get page path show for navigation
  getPagePath(url: string): string {
    url = url.split('?')[0].split('#')[0];
    if (url.startsWith('/')) url = url.slice(1);
    if (!url) return '';
    if (url === 'create-page') {
      return 'Employee Details \\ Create Employee';
    }
    if (url === 'employee-list') {
      return 'Employee Details \\ View Employee';
    }
    if (url === 'task-page') {
      return 'Daily Task';
    }
    if (url === 'task-approve-page') {
      return 'Daily Task \\ Approve Task';
    }
    if (url === 'attandance-page') {
      return 'Attendance \\ My Attendance';
    }
    if (url === 'manager-attandance-page') {
      return 'Attendance \\ Approve Attendance';
    }
    if (url === 'task-approve-page') {
      return 'Daily Task \\ Approve Task';
    }
    if (url === 'leave-page') {
      return 'Leave \\ Leave Request';
    }
    if (url === 'leave-approve-page') {
      return 'Leave \\ Approve Leave';
    }
    if (url === 'weekly-timesheet') {
      return 'Weekly Timesheet';
    }
    // Add more parent-child mappings as needed
    // Default fallback
    const segmentMap: { [key: string]: string } = {
      'employee-list': 'Employee Details',
      'create-page': 'Create Employee',
      'attandance-page': 'Attendance',
      'manager-attandance-page': 'Manager Attendance',
      'leave-page': 'Leave Request',
      'leave-approve-page': 'Approve Leave',
      'report': 'Report',
      'profile-page': 'My Profile',
      'task-page': 'Task Details',
      'task-approve-page': 'Approve Task',
      'weekly-timesheet': 'Weekly Timesheet',
    };
    const segments = url.split('/').filter(Boolean);
    const mapped = segments.map(seg => segmentMap[seg] || this.capitalize(seg.replace(/-/g, ' ')));
    return mapped.join(' \\ ');
  }
 
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
 
  // dashboard(event: Event) {
  //   event.preventDefault();
  //   // Optional: clear session or local storage
  //   localStorage.clear();
 
  //   // Navigate to login page
  //   this.router.navigate(['/create-page']);
  // }
  // Assume this is set elsewhere
 
  dashboard(event: Event) {
    localStorage.clear();
    event.preventDefault();
 
    // Always navigate to a blank Create Page (force reload)
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/create-page'], {
        state: {
          employeeData: null,
          viewMode: false,
          editMode: false
        }
      });
    });
  }
 
  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      // Add document click listener
      this.removeClickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
        const menu = this.el.nativeElement.querySelector('.profile-menu-container');
        if (menu && !menu.contains(event.target as Node)) {
          this.closeProfileMenu();
        }
      });
    } else {
      this.removeDocumentClick();
    }
  }
 
 
 
  // Hamburger menu logic
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      // Add document click listener for menu
      setTimeout(() => {
        this.removeMenuClickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
          const menu = this.el.nativeElement.querySelector('.menu-container');
          if (menu && !menu.contains(event.target as Node)) {
            this.closeMenuDropdown();
          }
        });
      });
    } else {
      this.closeMenuDropdown();
    }
    if (!this.menuOpen) {
      this.openSubMenu = null;
    }
  }
 
  closeMenuDropdown() {
    this.menuOpen = false;
    this.openSubMenu = null;
    this.removeMenuDocumentClick();
  }
 
  private removeMenuDocumentClick() {
    if (this.removeMenuClickListener) {
      this.removeMenuClickListener();
      this.removeMenuClickListener = null;
    }
  }
 
  toggleSubMenu(menu: string) {
    if (this.openSubMenu === menu) {
      this.openSubMenu = null;
    } else {
      this.openSubMenu = menu;
    }
  }
 
  // Close menu when any menu or submenu item is clicked
  onMenuItemClick(event: Event) {
    this.closeMenuDropdown();
  }
 
  get isAdmin(): boolean {
    return this.currentRoleName.toLowerCase() === 'admin';
  }
 
  get isRegularUser(): boolean {
    return this.currentRoleName.toLowerCase() === 'user';
  }
 
  // Returns the timesheet value from sessionStorage (case-insensitive)
  get timesheetType(): string {
    const val = sessionStorage.getItem('timesheet') || '';
    return val.trim().toLowerCase();
  }
 
  EmployeeList(event: Event) {
    event.preventDefault();
    this.router.navigate(['/employee-list']);
    this.onMenuItemClick(event);
  }
 
 
  userLeave(event: Event) {
    event.preventDefault();
    this.router.navigate(['leave-page']);
    this.onMenuItemClick(event);
  }
 
 
  managerLeave(event: Event) {
    event.preventDefault();
    this.router.navigate(['/leave-approve-page']);
    this.onMenuItemClick(event);
  }
 
 
  userTask(event: Event) {
    event.preventDefault();
    this.router.navigate(['task-page']);
    this.onMenuItemClick(event);
  }
 
 
  holidayCalendar(event: Event) {
    event.preventDefault();
    this.router.navigate(['/holiday-calendar']);
    this.onMenuItemClick(event);
  }
 
  profile(event: Event) {
    event.preventDefault();
    // Optional: clear session or local storage
    localStorage.clear();
 
    // Navigate to login page
    this.router.navigate(['/profile-page']);
  }
  closeProfileMenu() {
    this.showProfileMenu = false;
    this.removeDocumentClick();
  }
 
  private removeDocumentClick() {
    if (this.removeClickListener) {
      this.removeClickListener();
      this.removeClickListener = null;
    }
  }
 
  logout(event: Event) {
    event.preventDefault();
    sessionStorage.clear();
    // Navigate to login page
    this.router.navigate(['']).then(() => {
      // Manually update isLoginPage after navigation
      this.isLoginPage = this.router.url.toLowerCase().includes('login');
    });
  }
 
  weeklyTimesheet(event: Event) {
    event.preventDefault();
    this.router.navigate(['/weekly-timesheet']);
    this.onMenuItemClick(event);
  }
 
 
  // Add these properties to your existing component class
  showResetPasswordModal = false;
  currentPasswordVerified = false;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
 
  // Add these methods to your existing component class
 
  // Reset Password Methods
  openResetPassword() {
    this.showResetPasswordModal = true;
    this.resetPasswordForm();
  }
 
  closeResetPasswordModal() {
    this.showResetPasswordModal = false;
    this.resetPasswordForm();
  }
 
  resetPasswordForm() {
    this.currentPasswordVerified = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
  // Hide & show password  icon button
 showCurrentPassword: boolean = false;
 showNewPassword: boolean = false;
 showConfirmPassword: boolean = false;
 showNotificationIcon = true;
 
toggleCurrentPassword() {
  this.showCurrentPassword = !this.showCurrentPassword;
}
 
toggleNewPassword() {
  this.showNewPassword = !this.showNewPassword;
}
 
toggleConfirmPassword() {
  this.showConfirmPassword = !this.showConfirmPassword;
}
  showNotificationDropdown = false;
  private removeNotificationClickListener: (() => void) | null = null;
 
  toggleNotificationDropdown() {
    this.showNotificationDropdown = !this.showNotificationDropdown;
    if (this.showNotificationDropdown) {
      // Add document click listener
      setTimeout(() => {
        this.removeNotificationClickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
          const notifIcon = this.el.nativeElement.querySelector('.notification-icon');
          if (notifIcon && !notifIcon.contains(event.target as Node)) {
            this.closeNotificationDropdown();
          }
        });
      });
    } else {
      this.closeNotificationDropdown();
    }
  }
 
  closeNotificationDropdown() {
    this.showNotificationDropdown = false;
    this.removeNotificationDocumentClick();
  }
 
  private removeNotificationDocumentClick() {
    if (this.removeNotificationClickListener) {
      this.removeNotificationClickListener();
      this.removeNotificationClickListener = null;
    }
  }
 
 
  resetPassword() {
    // Validate current password
    if (!this.currentPassword) {
      this.showToastError("Please enter your current password.");
      return;
    }
 
    // Validate new passwords
    if (!this.newPassword || !this.confirmPassword) {
      this.showToastError("Please enter new password and confirm it.");
      return;
    }
 
    if (this.newPassword !== this.confirmPassword) {
      this.showToastError("Passwords do not match.");
      return;
    }
 
    if (this.newPassword.length < 6) {
      this.showToastError("Password must be at least 6 characters long.");
      return;
    }
 
    // Get user email from sessionStorage
    const userEmail = sessionStorage.getItem('email');
    console.log('Email from sessionStorage:', userEmail);
 
    if (!userEmail) {
      this.showToastError("User email not found. Please log in again.");
      return;
    }
 
    console.log('Starting password change process for:', userEmail);
 
    // Verify old password by calling backend
    const verifyPayload = {
      Email: userEmail,
      OldPassword: this.currentPassword
    };
 
    console.log('Sending verify payload:', verifyPayload);
 
    this.apiService.verifyOldPassword(verifyPayload).subscribe({
      next: (response: any) => {
        console.log('Verify API Response:', response);
 
        // Check for the actual response structure from your API
        if (response && response.message === "Old password verified successfully") {
          console.log('Old password verified successfully');
 
          // Change password payload - include OldPassword as required by your backend
          const changePasswordPayload = {
            Email: userEmail,
            OldPassword: this.currentPassword, // Include old password
            NewPassword: this.newPassword,
            ConfirmPassword: this.confirmPassword
          };
 
          console.log('Sending change password payload:', changePasswordPayload);
 
          this.apiService.changePassword(changePasswordPayload).subscribe({
            next: (changeResponse: any) => {
              // console.log('Change password API Response:', changeResponse);
              this.showToastSuccess("Password Change  successfully!");
              setTimeout(() => {
                this.closeResetPasswordModal();
              }, 2000);
            },
            error: (error: any) => {
              console.error("Change password failed:", error);
 
              // Handle specific backend errors
              if (error.error && error.error.includes('OTP verification required')) {
                this.showToastError("OTP verification required. Please use forgot password instead.");
              } else {
                this.showToastError("Password change failed. Please try again.");
              }
            }
          });
        } else {
          // console.log('Old password verification failed - response:', response);
          this.showToastError("Current password is incorrect.");
        }
      },
      error: (error: any) => {
        // console.error("Password verification failed:", error);
        this.showToastError("Password verification failed. Please try again.");
      }
    });
  }
}
 
 
 