import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import * as XLSX from 'xlsx';
import { ApiService } from '../../../services/services';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-leave-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule, ToastModule,DropdownModule],
  templateUrl: './leave-page.component.html',
  styleUrls: ['./leave-page.component.css']
})
export class LeavePageComponent implements OnInit {
  // Call this when the approval input changes
  onApprovalInputChange(value: string) {
    const search = value ? value.trim().toLowerCase() : '';
    if (search === '') {
      this.filteredApprovalOptions = [...this.approvalOptions];
    } else {
      this.filteredApprovalOptions = this.approvalOptions.filter(option =>
        option.name.toLowerCase().includes(search) || option.email.toLowerCase().includes(search)
      );
    }
  }
  approvalDropdownOpen: boolean = false;
  // List of admin/manager names for approval select box
  approvalOptions: { name: string; email: string }[] = [];
  // Filtered options for approval dropdown
  filteredApprovalOptions: { name: string; email: string }[] = [];

  // Fetch admin and manager names for approval select box
  fetchManagerAdminName() {
    this.apiService.getAllUsers().subscribe((users: any[]) => {
      const options = users
        .filter(user => user.role === 'Admin' || user.role === 'Manager')
        .map(user => ({
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email || user.mail || user.emailId || ''
        }));
      this.approvalOptions = [...options];
      this.filteredApprovalOptions = [...this.approvalOptions];
    });
  }

  // Watcher for opening leave request modal
  set showLeaveRequestModal(val: boolean) {
    this._showLeaveRequestModal = val;
    if (val) {
      this.fetchAllLeaveCounts();
    }
  }
  get showLeaveRequestModal(): boolean {
    return this._showLeaveRequestModal;
  }
  private _showLeaveRequestModal: boolean = false;

  // State for optional holiday confirmation popup
  showOptionalHolidayConfirm: boolean = false;
  optionalHolidayDateInRange: string = '';

  // State for delete confirmation popup
  showDeleteConfirm: boolean = false;

  // Helper to check if any optional holiday is in the selected range
  getOptionalHolidayInRange(startDateStr: string, endDateStr: string): string | null {
    if (!startDateStr || !endDateStr) return null;
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    for (const date of this.optionalHolidayDates) {
      const d = new Date(date);
      if (d >= startDate && d <= endDate) {
        return date;
      }
    }
    return null;
  }
  // Calculate leave days between two dates, excluding official and optional holidays
  calculateLeaveDaysExcludingHolidays(startDateStr: string, endDateStr: string): number {
    if (!startDateStr || !endDateStr) return 0;
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

    // Determine isSatSun from allLeaveCounts (assume first record or fallback to true)
    let isSatSun = true;
    if (this.allLeaveCounts && this.allLeaveCounts.length > 0) {
      // Try to find a global/company setting, or use first record
      const config = this.allLeaveCounts.find(lc => lc.isSatSun !== undefined);
      console.log('isSatSun config from leave counts:', config);

      if (config) {
        isSatSun = config.isSatSun === true || config.isSatSun === 'true';
      }
    }

    let count = 0;
    let current = new Date(startDate);
    while (current <= endDate) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
      // Exclude weekends and holidays based on IsSatSun
      if (
        (dayOfWeek !== 0 && (isSatSun ? dayOfWeek !== 6 : true)) &&
        !this.isHoliday(dateStr)
      ) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    // If all days are holidays/weekends, leave count should be 0
    return count;
  }

  // Check if a date is any holiday (official or optional)
  isHoliday(date: string): boolean {
    if (!date) return false;
    return this.officialHolidayDates.includes(date) || this.optionalHolidayDates.includes(date);
  }
  // Store optional holidays (should be filled from API like officialHolidayDates)
  optionalHolidayDates: string[] = [];

  // Helper to get max leave count for a type
  getMaxLeaveCount(type: string): number {
    if (!this.allLeaveCounts || this.allLeaveCounts.length === 0) return 0;
    // Try to match typeOfLeaveRequest (case-insensitive, ignore minor typos)
    const match = this.allLeaveCounts.find(lc => (lc.typeOfLeaveRequest || '').toLowerCase().replace(/\s+/g, '')
      .includes(type.toLowerCase().replace(/\s+/g, '')));
    return match ? match.count : 0;
  }
  // Store leave counts from API
  allLeaveCounts: any[] = [];
  // Helper to determine if Optional Holiday option should be shown
  get showOptionalHolidayOption(): boolean {
    return this.leaveTypeCounts.optionalHolidayCount < 2;
  }
  // Assign color and class for calendar events based on leave type
  getLeaveEventColorAndClass(leaveType: string) {
    switch (leaveType) {
      case 'Casual Leave':
        return { backgroundColor: '#2196f3', borderColor: '#2196f3', classNames: ['casual-leave'] };
      case 'Sick Leave':
        return { backgroundColor: '#e74c3c', borderColor: '#e74c3c', classNames: ['sick-leave'] };
      case 'Paid Leave':
        return { backgroundColor: '#16f157', borderColor: '#16f157', classNames: ['paid-leave'] };
      case 'Optional Holiday':
        return { backgroundColor: '#7d7d7e', borderColor: '#7d7d7e', classNames: ['optional-holiday'] };
      default:
        return { backgroundColor: '#056aad', borderColor: '#056aad', classNames: ['other-leave'] };
    }
  }

  leaveTypeCounts = {
    PaidLeaveCount: 0,
    casualLeaveCount: 0,
    sickLeaveCount: 0,
    optionalHolidayCount: 0,
    totalLeaveCount: 0
  };

  calculateLeaveCounts() {
    console.log('All filteredLeaveRequests:', this.filteredLeaveRequests);

    this.leaveTypeCounts.PaidLeaveCount = this.filteredLeaveRequests
      .filter(l => l.leaveType === 'Paid Leave' && l.status === 'Approved')
      .reduce((sum, l) => sum + (Number(l.leaveCount) || 0), 0);
    // console.log(this.leaveTypeCounts.PaidLeaveCount);

    this.leaveTypeCounts.casualLeaveCount = this.filteredLeaveRequests.filter(l => l.leaveType === 'Casual Leave' && l.status === 'Approved' || l.leaveType === 'Sick Leave' && l.status === 'Approved').reduce((sum, l) => sum + (Number(l.leaveCount) || 0), 0);
    this.leaveTypeCounts.sickLeaveCount = this.filteredLeaveRequests.filter(l => l.leaveType === 'Sick Leave' && l.status === 'Approved').length;
    this.leaveTypeCounts.optionalHolidayCount = this.filteredLeaveRequests.filter(l => l.leaveType === 'Optional Holiday' && l.status === 'Approved').reduce((sum, l) => sum + (Number(l.leaveCount) || 0), 0);
    this.leaveTypeCounts.totalLeaveCount =
      this.leaveTypeCounts.PaidLeaveCount +
      this.leaveTypeCounts.casualLeaveCount +
      this.leaveTypeCounts.optionalHolidayCount;
  }

  // Helper to determine if duration should be forced to Full Day
  isMultiDayLeave(leave: any): boolean {
    if (!leave.startDate || !leave.endDate) return false;
    return leave.startDate !== leave.endDate;
  }

  // Unified onDateChange for both newLeave and editLeave
  onDateChange(field: 'startDate' | 'endDate', isEdit: boolean = false) {
    const leave = isEdit ? this.editLeave : this.newLeave;
    const date = leave[field];
    if (field === 'endDate') {
      if (!leave.startDate) {
        leave.endDate = '';
        return;
      }
      if (date && leave.startDate && date < leave.startDate) {
        leave.endDate = '';
        return;
      }
    }
    if (field === 'startDate') {
      this.minEndDate = date || '';
      if (leave.endDate && date && leave.endDate < date) {
        leave.endDate = '';
      }
    }
    // Official holiday check
    if (this.isOfficialHoliday(date)) {
      this.showToast('warn', 'Warning', `Selected ${field === 'startDate' ? 'Start' : 'End'} Date is an official holiday`);
      leave[field] = '';
    }
    // Sunday check
    if (date && new Date(date).getDay() === 0) {
      this.showToast('warn', 'Warning', `Selected ${field === 'startDate' ? 'Start' : 'End'} Date is Sunday`);
      leave[field] = '';
    }
    // Auto-set duration to Full Day if multi-day
    if (leave.startDate && leave.endDate && leave.startDate !== leave.endDate) {
      leave.leaveDuration = 'Full Day';
    }
    // Optional holiday logic (only for newLeave)
    if (!isEdit && this.showLeaveRequestModal && this.leaveTypeCounts.optionalHolidayCount < 2) {
      const start = this.newLeave.startDate;
      const end = this.newLeave.endDate;
      const optionalHoliday = this.getOptionalHolidayInRange(start, end);
      if (optionalHoliday) {
        this.optionalHolidayDateInRange = optionalHoliday;
        this.showOptionalHolidayConfirm = true;
      } else {
        this.showOptionalHolidayConfirm = false;
        this.optionalHolidayDateInRange = '';
      }
    }
  }

  // Delete button click handler
  onDeleteAction() {
    if (!this.selectedLeave) {
      this.showToast('warn', 'Warning', 'Please select a row to cancel');
      return;
    }
    // Show custom popup for delete confirmation
    this.showDeleteConfirm = true;
  }
  isViewMode: boolean = false;
  // View button click handler
  onViewAction() {
    

    if (!this.selectedLeave) {
      this.showToast('warn', 'Warning', 'Please select a row to view');
      return;
    }
    this.editLeave = { ...this.selectedLeave };
    this.editLeave.startDate = this.formatDateForStorage(this.editLeave.startDate);
    this.editLeave.endDate = this.formatDateForStorage(this.editLeave.endDate);
    this.isViewMode = true;
    this.showEditModal = true;
  }
  
  selectedLeave: any = null;
  showEditModal: boolean = false;
  editLeave: any = {
    leaveType: '',
    leaveDuration: '',
    startDate: '',
    endDate: '',
    description: '',
    status: '',
    approval: '',
    mailBody: ''
  };
  // Select a leave row
  selectLeave(leave: any) {
    this.selectedLeave = leave;
  }

  // Edit button click handler
  onEditAction() {
    
    if (!this.selectedLeave) {
      this.showToast('warn', 'Warning', 'Please select a row to edit');
      return;
    }
    // Make a shallow copy for editing to avoid reference issues
    this.editLeave = { ...this.selectedLeave };
    this.editLeave.startDate = this.formatDateForStorage(this.editLeave.startDate);
    this.editLeave.endDate = this.formatDateForStorage(this.editLeave.endDate);
    // Fix approval field to match approvalOptions object
    if (this.editLeave.approval) {
      const approvalVal = this.editLeave.approval;
      const found = this.approvalOptions.find(opt =>
        opt.name === approvalVal || opt.email === approvalVal ||
        (typeof approvalVal === 'object' && opt.email === approvalVal.email)
      );
      if (found) {
        this.editLeave.approval = found;
      }
    }
    this.isViewMode = false;
    this.showEditModal = true;
  }

  // Called when user confirms delete in popup
  confirmDeleteLeave() {
    console.log('Confirming delete for leave:', this.selectedLeave);

    if (this.selectedLeave && this.selectedLeave.applicationId) {
      this.apiService.deleteLeaveRequest(this.selectedLeave.applicationId).subscribe({
        next: () => {

          this.leaveRequests = this.leaveRequests.filter(l => l.applicationId !== this.selectedLeave.applicationId);
          this.filteredLeaveRequests = this.filteredLeaveRequests.filter(l => l.applicationId !== this.selectedLeave.applicationId);
          this.calculateLeaveCounts();
          this.showToast('success', 'Success', 'Leave request deleted');
          this.selectedLeave = null;
          this.showDeleteConfirm = false;
        },
        error: (err) => {
          this.showToast('error', 'Error', 'Failed to delete leave request');
          this.showDeleteConfirm = false;
        }
      });
    } else {
      this.showDeleteConfirm = false;
    }
  }

  // Called when user cancels delete in popup
  cancelDeleteLeave() {
    this.showDeleteConfirm = false;
  }

  isRowDisabled(leave: any): boolean {
    if (!leave) return false;
    if (leave.status === 'Rejected') return true;
    if (leave.status === 'Approved') {
      // Compare leave.startDate (string) with today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(leave.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (startDate < today) return true;
    }
    return false;
  }
  // saveEdit() {
  //   if (!this.editLeave.leaveType || !this.editLeave.startDate || !this.editLeave.endDate || !this.editLeave.description) {
  //     this.showToast('warn', 'Warning', 'Please fill all fields');
  //     return;
  //   }
  //   // Update the selectedLeave with edited values
  //   Object.assign(this.selectedLeave, this.editLeave);
  //   this.showEditModal = false;
  //   this.showToast('success', 'Success', 'Leave request updated');
  //   // Optionally, call API to persist changes here
  // }


  saveEdit() {
    // Check for approved leave date overlap (edit mode)
    
    const startDate = this.editLeave.startDate;
    const endDate = this.editLeave.endDate;
    const approvedLeaves = this.leaveRequests.filter(l => l.status === 'Approved' && l.applicationId !== this.editLeave.applicationId);
    function toDateOnlyString(dateStr: string): string {
      if (!dateStr) return '';
      return dateStr.split('T')[0];
    }
    function isRangeOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
      if (!s1 || !e1 || !s2 || !e2) return false;
      const start1 = new Date(toDateOnlyString(s1));
      const end1 = new Date(toDateOnlyString(e1));
      const start2 = new Date(toDateOnlyString(s2));
      const end2 = new Date(toDateOnlyString(e2));
      return start1 <= end2 && end1 >= start2;
    }
    const overlap = approvedLeaves.some(l => isRangeOverlap(startDate, endDate, l.startDate, l.endDate));
    if (overlap) {
      this.showToast('error', 'Error', 'Selected date already has an approved leave.');
      return;
    }
    if (!this.editLeave) return;

    // Official holiday validation for edit
    if (this.isOfficialHoliday(this.editLeave.startDate)) {
      this.showToast('warn', 'Warning', 'Selected Start Date is an official holiday');
      this.editLeave.startDate = '';
      return;
    }
    if (this.isOfficialHoliday(this.editLeave.endDate)) {
      this.showToast('warn', 'Warning', 'Selected End Date is an official holiday');
      this.editLeave.endDate = '';
      return;
    }

    // Validate required fields and show toast for each missing
    if (!this.editLeave.leaveType) {
      this.showToast('warn', 'Warning', 'Please fill Leave Type');
      return;
    }
    if (!this.editLeave.leaveDuration) {
      this.showToast('warn', 'Warning', 'Please select Duration');
      return;
    }
    if (!this.editLeave.startDate) {
      this.showToast('warn', 'Warning', 'Please fill Start Date');
      return;
    }
    if (!this.editLeave.endDate) {
      this.showToast('warn', 'Warning', 'Please fill End Date');
      return;
    }
    if (!this.editLeave.to) {
      this.showToast('warn', 'Warning', 'Please enter To mail');
      return;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!this.editLeave.to || !emailPattern.test(this.editLeave.to.trim())) {
      this.showToast('warn', 'Warning', 'Please enter a valid "To" email address');
      return;
    }
    // if (!this.editLeave.cc) {
    //   this.showToast('warn', 'Warning', 'Please enter CC mail');
    //   return;
    // }
    // if (!this.editLeave.CC || !emailPattern.test(this.editLeave.CC.trim())) {
    //   this.showToast('error', 'Warning', 'Please enter a valid "CC" email address');
    //   return;
    // }
    if (!this.editLeave.description || this.editLeave.description.trim() === '') {
      this.showToast('warn', 'Warning', 'Please enter Reason');
      return;
    }
    // Warn if start or end date is Sunday
    if (this.editLeave.startDate && new Date(this.editLeave.startDate).getDay() === 0) {
      this.showToast('warn', 'Warning', 'Selected Start Date is Sunday');
      return;
    }
    if (this.editLeave.endDate && new Date(this.editLeave.endDate).getDay() === 0) {
      this.showToast('warn', 'Warning', 'Selected End Date is Sunday');
      return;
    }
    // Optional holiday validation for edit
    // const optHoliday = this.getOptionalHolidayInRange(this.editLeave.startDate, this.editLeave.endDate);
    // if (this.editLeave.leaveType === 'Optional Holiday') {
      
    // if(!optHoliday) {
    //   console.log('optional hoilday is not selected ',optHoliday);
    //     this.showToast('warn', 'Warning', 'Selected date is not an optional holiday.');
    //     return;
    //   }
   
    // }

const isOfficialHoliday = this.isOfficialHoliday(this.newLeave.startDate);
if (isOfficialHoliday) {
  this.showToast('warn', 'Warning', 'Selected date is an official holiday. Leave cannot be applied.');
  return;
}

// Optional holiday logic
if (this.newLeave.leaveType === 'Optional Holiday') {
  const optionalHoliday = this.getOptionalHolidayInRange(
    this.newLeave.startDate,
    this.newLeave.endDate
  );

  if (!optionalHoliday) {
   
    this.showToast('Warn', 'Warning', 'Selected date does not match an optional holiday.');
    return;
  } else {
   
    this.showToast('success', 'Success', 'Optional holiday leave applied successfully.');
  }
 
}

    // Recalculate leaveCount for edit
    let leaveDays = this.calculateLeaveDaysExcludingHolidays(startDate, endDate);
    if (this.editLeave.leaveDuration === 'First Half' || this.editLeave.leaveDuration === 'Second Half') {
      leaveDays = 0.5;
    }
    this.editLeave.leaveCount = leaveDays;

    // Debug: log editLeave before creating payload
    console.log('editLeave before save:', this.editLeave);

    // Convert approval to string (email) for backend
    // add devyani patil 
   // To update leave on the approval page and return the visible leave 
    // const payload = { ...this.editLeave };
    const payload = { ...this.editLeave, status: 'Pending' };
    if (payload.approval && typeof payload.approval === 'object') {
      payload.approval = payload.approval.email;
    }
    // Ensure applicationId is included for backend update
    if (this.selectedLeave && this.selectedLeave.applicationId) {
      payload.applicationId = this.selectedLeave.applicationId;
    }
    console.log('Saving edited leave with payload:', payload);

    this.apiService.saveLeaveRequest(payload).subscribe({
      next: () => {
        // Update selectedLeave
        Object.assign(this.selectedLeave, payload);
        // Update leaveRequests and filteredLeaveRequests
        if (this.selectedLeave && this.selectedLeave.applicationId) {
          this.leaveRequests = this.leaveRequests.map(l =>
            l.applicationId === this.selectedLeave.applicationId ? { ...l, ...payload } : l
          );
          this.filteredLeaveRequests = this.filteredLeaveRequests.map(l =>
            l.applicationId === this.selectedLeave.applicationId ? { ...l, ...payload } : l
          );
        }
        this.showToast('success', 'Success', 'Leave request updated');
        this.showEditModal = false;
      },
      error: () => {
        this.showToast('error', 'Error', 'Failed to update leave request');
      }
    });
  }

  // Close modal without saving
  closeEditModal() {
    this.showEditModal = false;
    this.isViewMode = false;
  }
  @ViewChild('employeeTable', { static: false }) employeeTable!: ElementRef;
  selectedStatus: string = '';

  minEndDate: string = '';

  onStatusSelect() {
    if (!this.selectedStatus) {
      this.filteredLeaveRequests = [...this.leaveRequests];
      return;
    }
    this.filteredLeaveRequests = this.leaveRequests.filter(request => request.status === this.selectedStatus);
  }
  private apiService = inject(ApiService);
  constructor(private messageService: MessageService) { }

  officialHolidayDates: string[] = [];

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }

  allRequests: any[] = [];
  filteredLeaveRequests: any[] = [];
  searchText = '';
  userData: any;
  // Leave types available for selection
  leaveTypes = ['Casual Leave', 'Sick Leave', 'Paid Leave', 'Optional Holiday'];
  //Leave durations available for selection
  leaveDurations = ['Full Day', 'First Half', 'Second Half'];
  // Array to store all leave requests
  leaveRequests: any[] = [];
  // Loading and error states
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  empId: string = '';
  firstName: string = '';
  middleName: string = '';
  lastName: string = '';

  currentFilter: string = '';
  // Form model for new leave request
  newLeave = {
    leaveType: '',
    leaveDuration: '',
    startDate: this.getTodayDate(),
    endDate: this.getTodayDate(),
    description: '',
    status: 'Pending',
    to: '',
    cc: '',
    approval: '',
    mailBody: ''
  };

  getApprovalEmail(approval: any): string | null {
    if (approval && typeof approval === 'object' && 'email' in approval) {
      return approval.email;
    }
    return null;
  }

  // Helper to get today's date in YYYY-MM-DD format
  getTodayDate(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  getMinStartDate(): string {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() - 15);
    const yyyy = minDate.getFullYear();
    const mm = String(minDate.getMonth() + 1).padStart(2, '0');
    const dd = String(minDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }


  user = {
    empId: '',
    name: ''
  };

  showTableView: boolean = true;

  isManager = false;
  managerEmpId = '';
  employeesUnderManager: any[] = [];
  selectedEmployeeId  : string | null =null;  // For dropdown selection

  // Add this method to toggle between views
  toggleView() {
    this.showTableView = !this.showTableView;
  }


  // calendarOptions: CalendarOptions = {
  //   plugins: [dayGridPlugin],
  //   initialView: 'dayGridMonth',
  //   weekends: false,
  //   events: [
  //     { title: 'Meeting', start: new Date() }
  //   ]
  // };

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    weekends: true,
    events: [], // will be filled from API
    hiddenDays: [0]
  };
  isAdmin: boolean = false;
  allEmployees: any[] = [];
  // ngOnInit() {
  //   const empId = sessionStorage.getItem('empId');
  //   const role = sessionStorage.getItem('userRole');

  //   this.fetchOfficialHolidayDates();

  //   this.empId = sessionStorage.getItem('empId') || '';  // Or from AuthService etc.
  //   this.fetchAllLeaveRequests();

  //   console.log('empId:', this.empId);

  //   if (role === 'Manager') {
  //     this.isManager = true;
  //     this.managerEmpId = empId || '';
  //     this.selectedEmployeeId = empId || ''; // Set self by default
  //     this.fetchManagerEmployees(this.managerEmpId);

  //   }
  //   console.log("manager: ", this.isManager, this.managerEmpId);
  //   this.loadUserData();
  //   this.fetchAllLeaveRequests();
  //   this.fetchLeaveRequestsCal();
  // }

  ngOnInit() {
    const empId = sessionStorage.getItem('empId');
    const role = sessionStorage.getItem('userRole');

    this.fetchOfficialHolidayDates();
    this.empId = sessionStorage.getItem('empId') || '';

    // Check roles
    this.isAdmin = role === 'Admin';
    this.isManager = role === 'Manager';

    if (this.isManager) {
      this.managerEmpId = empId || '';
      this.selectedEmployeeId = ""; // Empty selection
      this.fetchManagerEmployees(this.managerEmpId);
    }

    if (this.isAdmin) {
      this.selectedEmployeeId = ""; // Empty selection
      this.fetchAllEmployees();
    }

    // Load current user data regardless of dropdown selection
    this.loadUserData(this.empId);
    this.fetchAllLeaveRequests(this.empId);
    this.fetchLeaveRequestsCal(this.empId);
    this.fetchManagerAdminName();
    // Fetch all leave counts on page load
    this.fetchAllLeaveCounts();
  }

  // Fetch all leave counts from API
  fetchAllLeaveCounts() {
    this.apiService.getAllLeaveCounts().subscribe({
      next: (counts: any[]) => {
        // console.log('Leave Counts API Response:', counts);

        // Get companyName from session storage
        const companyName = sessionStorage.getItem('companyName');
        // console.log('Company Name from session:', companyName);

        // Filter counts by companyName if present
        let filteredCounts = counts;

        if (companyName) {
          filteredCounts = counts.filter(c => (c.companyName || '').toLowerCase() === companyName.toLowerCase());
        }
        this.allLeaveCounts = filteredCounts;
        // Optionally, do something with the counts here
        // console.log('All Leave Counts:', filteredCounts);
      },
      error: (err) => {
        console.error('Error fetching leave counts:', err);
      }
    });
  }
  fetchAllEmployees() {
    this.apiService.getAllUsers().subscribe({
      next: (employees: any[]) => {
        this.allEmployees = employees;
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
      }
    });
  }

  fetchManagerEmployees(managerEmpId: string) {
    this.apiService.getAllUsers().subscribe((users: any[]) => {
      const underManager = users.filter(user => user.reportingManager === managerEmpId);

      const selfUser = users.find(user => user.empId === managerEmpId);
      if (selfUser) {
        underManager.unshift(selfUser); // Add self at the top
      }

      this.employeesUnderManager = underManager;
    });
  }


  // loadUserData() {
  //   const empId = sessionStorage.getItem('empId');
  //   if (!empId) {
  //     console.warn('Emp ID missing');
  //     return;
  //   }
  //   this.apiService.getUserById(empId).subscribe({
  //     next: (response) => {
  //       console.log('User API Response:', response);
  //       this.userData = {
  //         empId: response.empId,
  //         firstName: response.firstName,
  //         middleName: response.middleName,
  //         lastName: response.lastName,
  //       };
  //       // Initialize these values for submission
  //       this.empId = response.empId;
  //       // this.user.name = `${response.firstName} ${response.middleName || ''} ${response.lastName}`.trim();
  //       this.firstName = response.firstName;
  //       this.middleName = response.middleName;
  //       this.lastName = response.lastName;
  //     },
  //     error: (err) => {
  //       console.error('Error fetching user data:', err);
  //       this.userData = null;
  //     }
  //   });
  // }

  loadUserData(empId?: string) {
    const targetEmpId = empId || sessionStorage.getItem('empId');
    if (!targetEmpId) {
      console.warn('Emp ID missing');
      return;
    }

    this.apiService.getUserById(targetEmpId).subscribe({
      next: (response) => {
        console.log('User API Response:', response);
        this.userData = {
          empId: response.empId,
          firstName: response.firstName,
          middleName: response.middleName,
          lastName: response.lastName,
        };

        this.empId = response.empId;
        this.firstName = response.firstName;
        this.middleName = response.middleName;
        this.lastName = response.lastName;
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
        this.userData = null;
      }
    });
  }

  // onEmployeeSelect() {
  //   if (this.selectedEmployeeId) {
  //     this.fetchLeaveRequestsCal(this.selectedEmployeeId);
  //     this.fetchAllLeaveRequests(this.selectedEmployeeId);
  //   }
  // }
  onEmployeeSelect() {
    if (this.selectedEmployeeId) {
      // For admin/manager, load data for selected employee
      const targetEmpId = this.isAdmin || this.isManager ? this.selectedEmployeeId : this.empId;
      this.loadUserData(targetEmpId);
      this.fetchAllLeaveRequests(targetEmpId);
      this.fetchLeaveRequestsCal(targetEmpId);
    } else {
      // If "Select Employee" is chosen, load current user data
      this.loadUserData(this.empId);
      this.fetchAllLeaveRequests(this.empId);
      this.fetchLeaveRequestsCal(this.empId);
    }
  }

  // added by devyani patil
  //invailda text remove  clikc on out side
 checkValidSelection(dropdownRef: any) {
  const allOptions = this.isAdmin ? this.allEmployees : this.employeesUnderManager;
  const validEmployee = allOptions.find((emp: any) => emp.empId === this.selectedEmployeeId);

  if (!validEmployee) {
    this.selectedEmployeeId = null;
    if (dropdownRef) {
      dropdownRef.filterValue = ''; 
    }
  }
}




  clearEmployeeData() {
    this.userData = null;
    this.leaveRequests = [];
    this.filteredLeaveRequests = [];
    this.leaveTypeCounts = {
      PaidLeaveCount: 0,
      casualLeaveCount: 0,
      sickLeaveCount: 0,
      optionalHolidayCount: 0,
      totalLeaveCount: 0
    };
    this.calendarOptions = {
      ...this.calendarOptions,
      events: []
    };
  }


  fetchLeaveRequestsCal(empId?: string) {
    const targetEmpId = empId || this.empId;
    this.apiService.getLeaveRequestByEmpId(targetEmpId).subscribe((data: any[]) => {
      let filteredData = data;

      if (empId) {
        filteredData = data.filter(item => item.empId === empId);
      }

      const leaveEvents = filteredData.map(item => {
        const eventProps = this.getLeaveEventColorAndClass(item.leaveType);
        return {
          id: item.applicationId.toString(),
          title: `${item.leaveType} (${item.status})`,
          start: item.startDate,
          end: new Date(new Date(item.endDate).getTime() + 86400000).toISOString(),
          extendedProps: {
            empId: item.empId,
            name: item.name,
            description: item.description,
            managerRemark: item.managerRemark,
            duration: item.duration
          },
          ...eventProps
        };
      });

      this.calendarOptions = {
        ...this.calendarOptions,
        events: leaveEvents,
        weekends: true,
        eventDidMount: (info) => {
          const props = info.event.extendedProps;
          const tooltip = `
Name: ${props['name']}
Description: ${props['description']}
Manager Remark: ${props['managerRemark']}
Status: ${info.event.title}
        `;
          info.el.setAttribute('title', tooltip);
        }
      };
    });
  }


  downloadTableAsExcel(): void {
    const table = this.employeeTable?.nativeElement;
    if (!table) return;
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Employees': worksheet },
      SheetNames: ['Employees']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    // Format current date as YYYY-MM-DD
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    anchor.download = `Leave_Records_${formattedDate}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }


  fetchAllLeaveRequests(empId?: string) {
    this.isLoading = true;
    this.errorMessage = '';

    const targetEmpId = empId || this.empId;
    console.log(this.empId);


    this.apiService.getLeaveRequestByEmpId(targetEmpId).subscribe({
      next: (response: any) => {
        console.log(response);
        console.log('API Response:', response);
        if (response) {
          // Get the array of leave requests
          let leaveArr = Array.isArray(response)
            ? response
            : (response.data || []);
          // Sort by startDate descending (future dates first)
          leaveArr = leaveArr.sort((a: any, b: any) => {
            const dateA = new Date(a.startDate).getTime();
            const dateB = new Date(b.startDate).getTime();
            return dateB - dateA;
          });
          this.leaveRequests = leaveArr;
          this.filteredLeaveRequests = [...leaveArr];
        }
        this.calculateLeaveCounts();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching leave requests:', err);
        this.errorMessage = 'Failed to load leave requests. Please try again.';
        this.isLoading = false;
      }
    });
  }
  //add devyani patil 
 cancelLeave() {
  this.showDeleteConfirm = false;

 
  this.newLeave = {
    leaveType: '',
    leaveDuration: '',
    startDate: '',
    endDate: '',
    description: '',
    status: '',       
    to: '',
    cc: '',
    approval: '',
    mailBody: ''       
  };

  //  Close the modal
  this.showLeaveRequestModal = false;
}


  submitLeave() {
    // Check for approved leave date overlap (any overlap in range)
    const startDate = this.newLeave.startDate;
    const endDate = this.newLeave.endDate;
    console.log(startDate, endDate);

    const approvedLeaves = this.leaveRequests.filter(l => l.status === 'Approved');
    function toDateOnlyString(dateStr: string): string {
      if (!dateStr) return '';
      // Handles both 'YYYY-MM-DD' and 'YYYY-MM-DDTHH:mm:ss' formats
      return dateStr.split('T')[0];
    }
    function isRangeOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
      if (!s1 || !e1 || !s2 || !e2) return false;
      const start1 = new Date(toDateOnlyString(s1));
      const end1 = new Date(toDateOnlyString(e1));
      const start2 = new Date(toDateOnlyString(s2));
      const end2 = new Date(toDateOnlyString(e2));
      // Overlap if start1 <= end2 && end1 >= start2
      return start1 <= end2 && end1 >= start2;
    }
    // Debug
    // console.log('approvedLeaves:', approvedLeaves);
    // console.log('newLeave:', startDate, endDate);
    const overlap = approvedLeaves.some(l => isRangeOverlap(startDate, endDate, l.startDate, l.endDate));
    if (overlap) {
      this.showToast('error', 'Error', 'Selected date already has an approved leave.');
      return;
    }

    // Check for optional holiday in range and leaveTypeCounts.optionalHolidayCount <= 2
    const optHoliday = this.getOptionalHolidayInRange(this.newLeave.startDate, this.newLeave.endDate);
    if (optHoliday) {
      const start = this.newLeave.startDate;
      const end = this.newLeave.endDate;
      let leaveDays = this.calculateLeaveDaysExcludingHolidays(start, end);
      if (this.newLeave.leaveDuration === 'First Half' || this.newLeave.leaveDuration === 'Second Half') {
        leaveDays = 0.5;
      }
      // Only submit main leave request if leaveDays > 0
      if (leaveDays > 0) {
        const mainPayload = {
          empId: this.userData.empId,
          name: `${this.userData.firstName} ${this.userData.middleName || ''} ${this.userData.lastName}`.trim(),
          leaveType: this.newLeave.leaveType,
          leaveDuration: this.newLeave.leaveDuration,
          startDate: start,
          endDate: end,
          description: this.newLeave.description,
          status: 'Pending',
          to: this.newLeave.to,
          cc: this.newLeave.cc,
          leaveCount: leaveDays
        };
        // Optional holiday request: if already 2 or more, save as Paid Leave, else as Optional Holiday
        const optPayload = {
          empId: this.userData.empId,
          name: `${this.userData.firstName} ${this.userData.middleName || ''} ${this.userData.lastName}`.trim(),
          leaveType: this.leaveTypeCounts.optionalHolidayCount >= 2 ? 'Paid Leave' : 'Optional Holiday',
          leaveDuration: 'Full Day',
          startDate: optHoliday,
          endDate: optHoliday,
          description: this.leaveTypeCounts.optionalHolidayCount >= 2 ? 'Paid Leave (Exceeded Optional Holiday Limit)' : 'Optional Holiday',
          status: 'Pending',
          to: this.newLeave.to,
          cc: this.newLeave.cc,
          leaveCount: 1
        };
        // Save both requests
        this.apiService.saveLeaveRequest(mainPayload).subscribe({
          next: () => {
            this.apiService.saveLeaveRequest(optPayload).subscribe({
              next: () => {
                this.showToast('success', 'Success', 'Leave request submitted successfully');
                this.resetForm();
                this.fetchLeaveRequestsCal();
                this.calculateLeaveCounts();
                this.showLeaveRequestModal = false;
                this.fetchAllLeaveRequests(this.empId);
                this.isLoading = false;
              },
              error: () => {
                this.showToast('error', 'Error', 'Failed to submit optional holiday leave request');
                this.isLoading = false;
              }
            });
          },
          error: () => {
            this.showToast('error', 'Error', 'Failed to submit leave request');
            this.isLoading = false;
          }
        });
      } else {
        // Only submit the optional holiday request
        const optPayload = {
          empId: this.userData.empId,
          name: `${this.userData.firstName} ${this.userData.middleName || ''} ${this.userData.lastName}`.trim(),
          leaveType: this.leaveTypeCounts.optionalHolidayCount >= 2 ? 'Paid Leave' : 'Optional Holiday',
          leaveDuration: 'Full Day',
          startDate: optHoliday,
          endDate: optHoliday,
          description: this.leaveTypeCounts.optionalHolidayCount >= 2 ? 'Paid Leave (Exceeded Optional Holiday Limit)' : 'Optional Holiday',
          status: 'Pending',
          to: this.newLeave.to,
          cc: this.newLeave.cc,
          leaveCount: 1
        };
        this.apiService.saveLeaveRequest(optPayload).subscribe({
          next: () => {
            this.showToast('success', 'Success', 'Leave request submitted successfully');
            this.resetForm();
            this.fetchLeaveRequestsCal();
            this.calculateLeaveCounts();
            this.showLeaveRequestModal = false;
            this.fetchAllLeaveRequests(this.empId);
            this.isLoading = false;
          },
          error: () => {
            this.showToast('error', 'Error', 'Failed to submit optional holiday leave request');
            this.isLoading = false;
          }
        });
      }
      return;
    }
    // If leave type is 'Optional Holiday', check if selected range contains an optional holiday
    if (this.newLeave.leaveType === 'Optional Holiday') {
      if (!optHoliday) {
        this.showToast('warn', 'Warning', 'Selected date is not an optional holiday.');
        return;
      }
    }
    // Validate required fields and show toast for each missing
    if (!this.newLeave.leaveType) {
      this.showToast('warn', 'Warning', 'Please fill Leave Type');
      return;
    }
    if (!this.newLeave.leaveDuration) {
      this.showToast('warn', 'Warning', 'Please select Duration');
      return;
    }
    if (!this.newLeave.startDate) {
      this.showToast('warn', 'Warning', 'Please fill Start Date');
      return;
    }
    if (!this.newLeave.endDate) {
      this.showToast('warn', 'Warning', 'Please fill End Date');
      return;
    }
    if (!this.newLeave.to) {
      this.showToast('warn', 'Warning', 'Please enter To mail');
      return;
    }
    // if (!this.newLeave.cc) {
    //   this.showToast('warn', 'Warning', 'Please enter CC mail');
    //   return;
    // }
    // Mandatory Reason field check
    if (!this.newLeave.description || this.newLeave.description.trim() === '') {
      this.showToast('warn', 'Warning', 'Please enter Reason');
      return;
    }
    // Warn if start or end date is Sunday
    if (this.newLeave.startDate && new Date(this.newLeave.startDate).getDay() === 0) {
      this.showToast('warn', 'Warning', 'Selected Start Date is Sunday');
      return;
    }
    if (this.newLeave.endDate && new Date(this.newLeave.endDate).getDay() === 0) {
      this.showToast('warn', 'Warning', 'Selected End Date is Sunday');
      return;
    }
    // Email format validation
    const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
    // To/CC field can be comma or semicolon separated
    const toEmails = this.newLeave.to.split(/[,;]/).map(e => e.trim()).filter(e => e);
    const ccEmails = this.newLeave.cc.split(/[,;]/).map(e => e.trim()).filter(e => e);
    if (!toEmails.every(email => emailRegex.test(email))) {
      this.showToast('warn', 'Warning', 'To mail format is invalid');
      return;
    }
    if (!ccEmails.every(email => emailRegex.test(email))) {
      this.showToast('warn', 'Warning', 'CC mail format is invalid');
      return;
    }
    // if (!this.newLeave.description) {
    //   this.showToast('warn', 'Warning', 'Please fill Reason');
    //   return;
    // }

    // Prevent submitting if start or end date is an official holiday
    if (this.isOfficialHoliday(this.newLeave.startDate)) {
      this.showToast('warn', 'Warning', ' Selected Start Date is an official holiday');
      this.newLeave.startDate = '';
      return;
    }
    if (this.isOfficialHoliday(this.newLeave.endDate)) {
      this.showToast('warn', 'Warning', ' SelectedEnd Date is an official holiday');
      this.newLeave.endDate = '';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Get raw date values from the input (YYYY-MM-DD format)
    const rawStartDate = this.newLeave.startDate;
    const rawEndDate = this.newLeave.endDate;

    // Calculate leave days excluding official holidays
    let leaveDays = this.calculateLeaveDaysExcludingHolidays(rawStartDate, rawEndDate);
    // If duration is First Half or Second Half, leaveCount should be 0.5
    if (this.newLeave.leaveDuration === 'First Half' || this.newLeave.leaveDuration === 'Second Half') {
      leaveDays = 0.5;
    }

    let approvalName = '';
    let approvalEmail = '';
    const approval: any = this.newLeave.approval;
    if (approval && typeof approval === 'object') {
      approvalName = approval.name;
      approvalEmail = approval.email;
    } else if (typeof approval === 'string') {
      approvalName = approval;
    }
    const payload = {
      empId: this.userData.empId,
      name: `${this.userData.firstName} ${this.userData.middleName || ''} ${this.userData.lastName}`.trim(),
      leaveType: this.newLeave.leaveType,
      leaveDuration: this.newLeave.leaveDuration,
      startDate: rawStartDate, // Use the raw value directly
      endDate: rawEndDate,     // Use the raw value directly
      description: this.newLeave.description,
      status: 'Pending',
      to: this.newLeave.to,
      cc: this.newLeave.cc,
      leaveCount: leaveDays,
      ApprovalName: approvalName,
      approvalEmail: approvalEmail, // Changed from ApprovalEmail to approval
      MailBody: this.newLeave.mailBody
    };

    console.log('Submitting payload:', payload);

    this.apiService.saveLeaveRequest(payload).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        // Create the new leave record with properly formatted dates
        const newLeave = {
          ...response,
          empId: response.empId || payload.empId,
          name: response.name || payload.name,
          leaveType: response.leaveType || payload.leaveType,
          leaveDuration: response.leaveDuration || payload.leaveDuration,
          startDate: response.startDate || payload.startDate,
          endDate: response.endDate || payload.endDate,
          description: response.description || payload.description,
          status: response.status || 'Pending',
          leaveCount: response.leaveCount || leaveDays
        };
        // Update the arrays
        this.leaveRequests = [newLeave, ...this.leaveRequests];
        this.filteredLeaveRequests = [newLeave, ...this.filteredLeaveRequests];
        this.showToast('success', 'Success', 'Leave request submitted successfully');
        this.resetForm();
        this.fetchLeaveRequestsCal();
        this.calculateLeaveCounts();
        this.showLeaveRequestModal = false; // Close popup on success
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error submitting leave:', error);
        this.showToast('error', 'Error', 'Failed to submit leave request');
        this.isLoading = false;
      }
    });
  }
 
  // Replace your existing date formatting methods with these:

  // formatDateForDisplay(dateString: string): string {
  //   if (!dateString) return '--';
  //   // Accept YYYY-MM-DD or ISO format
  //   let date: Date;
  //   if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
  //     date = new Date(dateString + 'T00:00:00');
  //   } else {
  //     date = new Date(dateString);
  //   }
  //   if (isNaN(date.getTime())) return '--';
  //   const mm = String(date.getMonth() + 1).padStart(2, '0');
  //   const dd = String(date.getDate()).padStart(2, '0');
  //   const yyyy = date.getFullYear();
  //   return `${mm}/${dd}/${yyyy}`;
  // }
  formatDateForDisplay(dateString: string): string {
    if (!dateString) return '--';

    try {
      // Parse the date string
      let date: Date;

      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        // If it's already in YYYY-MM-DD format, parse it as local date
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) return '--';

      // Format as MM/DD/YYYY using local date components
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const yyyy = date.getFullYear();

      return `${mm}/${dd}/${yyyy}`;
    } catch {
      return '--';
    }
  }


  // formatDateForStorage(dateString: string): string {
  //   if (!dateString) return '';
  //   // Ensure date is in YYYY-MM-DD format
  //   if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

  //   try {
  //     // Parse as local date without timezone conversion
  //     const date = new Date(dateString);
  //     const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  //     const adjustedDate = new Date(date.getTime() + offset);
  //     return adjustedDate.toISOString().split('T')[0];
  //   } catch {
  //     return '';
  //   }
  // }
  formatDateForStorage(dateString: string): string {
    if (!dateString) return '';

    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

    try {
      // Parse the date string while preserving the local date
      const date = new Date(dateString);

      // Get the local date components (not UTC)
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');

      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return '';
    }
  }
  // Validate the leave request form
  private validateLeaveRequest(): boolean {
    // Clear previous messages
    this.errorMessage = '';

    // Check required fields
    if (!this.empId ||
      !this.user.name ||
      !this.newLeave.leaveType ||
      !this.newLeave.leaveDuration ||
      !this.newLeave.startDate ||
      !this.newLeave.endDate) {
      this.errorMessage = 'Please fill all required fields';
      return false;
    }

    // Check date validity
    const startDate = new Date(this.newLeave.startDate);
    const endDate = new Date(this.newLeave.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      this.errorMessage = 'Invalid date format';
      return false;
    }

    if (endDate < startDate) {
      this.errorMessage = 'End date cannot be before start date';
      return false;
    }

    return true;
  }

  // Reset the form after submission
  private resetForm() {
    this.newLeave = {
      leaveType: '',
      leaveDuration: '',
      startDate: this.getTodayDate(),
      endDate: this.getTodayDate(),
      description: '',
      status: 'Pending',
      to: '',
      cc: '',
      approval: '',
      mailBody: ''
    };
  }

  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return '--';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '--';

      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      return date.toLocaleDateString(undefined, options);
    } catch {
      return '--';
    }
  }

  // Format time for display
  formatTime(dateString: string): string {
    if (!dateString) return '--';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '--';

      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--';
    }
  }


  filterLeaveRequests() {
    if (!this.searchText) {
      this.filteredLeaveRequests = [...this.leaveRequests];
    } else {
      const searchTerm = this.searchText.toLowerCase().trim();
      this.filteredLeaveRequests = this.leaveRequests.filter(request => {
        // Filter by leave type only
        const leaveTypeMatch = request.leaveType?.toString().toLowerCase().includes(searchTerm) || false;
        return leaveTypeMatch;
      });
    }
    // Sort by createdOn descending (newest first)
    this.filteredLeaveRequests.sort((a, b) => {
      const dateA = new Date(a.createdOn).getTime();
      const dateB = new Date(b.createdOn).getTime();
      return dateB - dateA;
    });
  }
  // Call this whenever searchText changes
  onSearchChange() {
    this.filterLeaveRequests();
  }

  // Fetch official holiday dates from API
  fetchOfficialHolidayDates() {
    this.apiService.getAllHolidays().subscribe((holidays: any[]) => {
      // Get the selected holiday set from session storage
      const selectedHolidaySet = sessionStorage.getItem('holiday');
      let filteredHolidays = holidays;
      if (selectedHolidaySet) {
        filteredHolidays = holidays.filter(h => (h.holidaySet || '').toLowerCase() === selectedHolidaySet.toLowerCase());
      }
      this.officialHolidayDates = filteredHolidays
        .filter(h => h.type && h.type.toLowerCase().includes('official'))
        .map(h => h.date.split('T')[0]); // Ensure YYYY-MM-DD format

      this.optionalHolidayDates = filteredHolidays
        .filter(h => h.type && h.type.toLowerCase().includes('optional'))
        .map(h => h.date.split('T')[0]); // Ensure YYYY-MM-DD format
      console.log(this.optionalHolidayDates);
    });
  }

  // Check if a date is an official holiday
  isOfficialHoliday(date: string): boolean {
    if (!date) return false;
    return this.officialHolidayDates.includes(date);
  }


  // Handler for confirming optional holiday inclusion
  confirmOptionalHoliday(take: boolean) {
    this.showOptionalHolidayConfirm = false;
    if (!take) {
      // Remove the optional holiday from the selected range by adjusting end date
      // We'll set end date to the day before the optional holiday
      const d = new Date(this.optionalHolidayDateInRange);
      d.setDate(d.getDate() - 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const newEnd = `${yyyy}-${mm}-${dd}`;
      if (this.showLeaveRequestModal) {
        this.newLeave.endDate = newEnd;
      } else {
        this.editLeave.endDate = newEnd;
      }
    }
    // If take==true, do nothing (leave as is)
  }

  filterByLeaveType(leaveType: string) {
    this.currentFilter = leaveType;
    this.filteredLeaveRequests = this.leaveRequests.filter(request =>
      request.leaveType === leaveType
    );
  }

  clearFilter() {
    this.currentFilter = '';
    this.filteredLeaveRequests = [...this.leaveRequests];
  }

  //added by Ankita Panchal
  get selectedEmployee(): any {
    const employees = this.isAdmin ? this.allEmployees : this.employeesUnderManager;
    return employees.find(emp => emp.empId === this.selectedEmployeeId);
  }
}