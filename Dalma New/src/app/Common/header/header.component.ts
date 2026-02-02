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
  imports: [CommonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  // existing fields
  allRequests: any[] = [];
  filteredRequests: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  adminLeaveRequestCount: number = 0;
  managerLeaveRequestCount: number = 0;
  pendingLeaveCount: number = 0;

  // Role data (optional)
  roles: Array<{ roleId: number; roleName: string }> = [];
  rolesLoading = false;
  rolesError = '';

  // Permission booleans (use in template)
  showEmployeeDetails = false;
  showCreateEmployee = false;
  showViewEmployee = false;
  showLeaveRequest = false;
  showApproveLeave = false;
  showDailyTask = false;
  showHolidayCalendar = false;

  // Writable role flags (used by template *ngIf="isAdmin" etc.)
  isAdmin: boolean = false;
  isManager: boolean = false;
  isRegularUser: boolean = false;

  // services & injection
  private leaveNotificationService = inject(LeaveNotificationService);
  showProfileMenu = false;
  isLoginPage = false;
  pageTitle: string = '';
  pagePath: string = '';
  currentDate: string = '';
  userInitial: string = '';
  menuOpen: boolean = false;
  openSubMenu: string | null = null;
  private removeClickListener: (() => void) | null = null;
  private removeMenuClickListener: (() => void) | null = null;
  private removeNotificationClickListener: (() => void) | null = null;

  private router = inject(Router);
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  // -------------------------
  // Leave counts and fetching
  // -------------------------
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
    // guard - only admin should open approve page
    if (!this.showApproveLeave) {
      this.showToastError('Not authorized to view approve leave page.');
      return;
    }
    this.router.navigate(['/leave-approve-page']);
    this.showNotificationDropdown = false;
  }

  // -------------------------
  // Updated Constructor
  // -------------------------
  constructor() {
    // keep constructor lightweight; navigation handling is in ngOnInit
  }

  // -------------------------
  // Role & permission logic
  // -------------------------
  fetchRoles() {
    // Optional: fetch master role definitions if needed
    this.rolesLoading = true;
    this.rolesError = '';
    this.apiService.getAllRoles().subscribe({
      next: (res: any) => {
        this.roles = Array.isArray(res) ? res : (res?.data || []);
        this.rolesLoading = false;
      },
      error: (err) => {
        console.error('Failed to load roles', err);
        this.rolesError = 'Failed to load roles';
        this.rolesLoading = false;
      }
    });
  }

  /**
   * configureMenuForRole - set boolean flags used in template
   * Accepts 'admin' | 'manager' | 'user' (case-insensitive)
   */
  configureMenuForRole(role: string) {
    const r = (role || '').toLowerCase();
    // debug
    console.log('configureMenuForRole:', r);

    // reset
    this.showEmployeeDetails = false;
    this.showCreateEmployee = false;
    this.showViewEmployee = false;
    this.showLeaveRequest = false;
    this.showApproveLeave = false;
    this.showDailyTask = false;
    this.showHolidayCalendar = false;

    if (r === 'admin') {
      this.showEmployeeDetails = true;
      this.showCreateEmployee = true;
      this.showViewEmployee = true;
      this.showLeaveRequest = true;
      this.showApproveLeave = true;
      this.showDailyTask = true;
      this.showHolidayCalendar = true;
    } else if (r === 'manager') {
      // Manager: hide employee details; show leave request and approve (if you want manager to approve, set true)
      this.showEmployeeDetails = false;
      this.showCreateEmployee = false;
      this.showViewEmployee = false;
      this.showLeaveRequest = true;
      // managers typically get approve access — if not, keep false
      this.showApproveLeave = true;
      this.showDailyTask = true;
      this.showHolidayCalendar = true;
    } else if (r === 'user') {
      // Regular user: hide employee details; leave request only; no approve
      this.showEmployeeDetails = false;
      this.showCreateEmployee = false;
      this.showViewEmployee = false;
      this.showLeaveRequest = true;
      this.showApproveLeave = false;
      this.showDailyTask = true;
      this.showHolidayCalendar = true;
    } else {
      // default: minimal
      this.showEmployeeDetails = false;
    }
  }

  // -------------------------
  // Toast helpers
  // -------------------------
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

  // -------------------------
  // ngOnInit (updated & consolidated)
  // -------------------------
  ngOnInit() {
    // initialize role flags from sessionStorage (single source of truth)
    const rawRole = (sessionStorage.getItem('userRole') || '').toLowerCase();
    this.isAdmin = rawRole === 'admin';
    this.isManager = rawRole === 'manager';
    this.isRegularUser = rawRole === 'user';

    // configure menu booleans once on init
    this.configureMenuForRole(rawRole);

    // Show notification icon only for admin or manager
    this.showNotificationIcon = ['admin', 'manager'].includes(rawRole);

    // Subscribe to pending count observables and only set pending count when the corresponding role is active
    this.leaveNotificationService.adminPendingCount$.subscribe(count => {
      if (this.isAdmin) {
        this.pendingLeaveCount = count;
      }
    });
    this.leaveNotificationService.managerPendingCount$.subscribe(count => {
      if (this.isManager) {
        this.pendingLeaveCount = count;
      }
    });

    // Fetch leave requests if admin/manager
    if (this.isAdmin) {
      this.fetchLeaveRequestsForAdmin();
    } else if (this.isManager) {
      this.fetchLeaveRequestsForManager();
    }

    // Optional: fetch master roles
    this.fetchRoles();

    // single router event subscription for titles, path, isLoginPage and userInitial updates
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.isLoginPage = url.toLowerCase().includes('login');
      this.pageTitle = this.getPageTitle(url);
      this.pagePath = this.getPagePath(url);
      const userName = sessionStorage.getItem('userName') || '';
      this.userInitial = userName ? userName.charAt(0).toUpperCase() : '';
    });

    // clock
    this.updateDate();
    setInterval(() => {
      this.updateDate();
    }, 1000);
  }

  // -------------------------
  // Rest of your existing helpers/navigation methods (unchanged)
  // -------------------------
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

  // Navigation helpers
  dashboard(event: Event) {
    localStorage.clear();
    event.preventDefault();

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

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
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

  onMenuItemClick(event: Event) {
    this.closeMenuDropdown();
  }

  // timesheetType getter remains
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
    localStorage.clear();
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
    this.router.navigate(['']).then(() => {
      this.isLoginPage = this.router.url.toLowerCase().includes('login');
    });
  }

  weeklyTimesheet(event: Event) {
    event.preventDefault();
    this.router.navigate(['/weekly-timesheet']);
    this.onMenuItemClick(event);
  }

  // Reset password UI & logic (unchanged)
  showResetPasswordModal = false;
  currentPasswordVerified = false;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

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

  // Password reset API interaction (unchanged)
  resetPassword() {
    if (!this.currentPassword) {
      this.showToastError("Please enter your current password.");
      return;
    }

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

    const userEmail = sessionStorage.getItem('email');
    console.log('Email from sessionStorage:', userEmail);

    if (!userEmail) {
      this.showToastError("User email not found. Please log in again.");
      return;
    }

    const verifyPayload = {
      Email: userEmail,
      OldPassword: this.currentPassword
    };

    console.log('Sending verify payload:', verifyPayload);

    this.apiService.verifyOldPassword(verifyPayload).subscribe({
      next: (response: any) => {
        console.log('Verify API Response:', response);

        if (response && response.message === "Old password verified successfully") {
          const changePasswordPayload = {
            Email: userEmail,
            OldPassword: this.currentPassword,
            NewPassword: this.newPassword,
            ConfirmPassword: this.confirmPassword
          };

          this.apiService.changePassword(changePasswordPayload).subscribe({
            next: (changeResponse: any) => {
              this.showToastSuccess("Password Change successfully!");
              setTimeout(() => {
                this.closeResetPasswordModal();
              }, 2000);
            },
            error: (error: any) => {
              console.error("Change password failed:", error);
              if (error.error && error.error.includes('OTP verification required')) {
                this.showToastError("OTP verification required. Please use forgot password instead.");
              } else {
                this.showToastError("Password change failed. Please try again.");
              }
            }
          });
        } else {
          this.showToastError("Current password is incorrect.");
        }
      },
      error: (error: any) => {
        this.showToastError("Password verification failed. Please try again.");
      }
    });
  }
}

