import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import * as XLSX from 'xlsx';
import { ApiService, LeaveNotificationService } from '../../../services/services';
@Component({
  selector: 'app-leave-approve',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './leave-approve-page.component.html',
  styleUrls: ['./leave-approve-page.component.css']
})

// Removed duplicate class declaration
export class LeaveApprovePageComponent implements OnInit {
  showApproveModal: boolean = false;
  approveRequest: any = null;
  modalAction: 'approve' | 'reject' = 'approve';

  rejectLeave(request: any) {
    this.approveRequest = request;
    this.modalAction = 'reject';
    this.showApproveModal = true;
  }

  private updateLeaveStatus(request: any, status: string) {
    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      ApplicationId: request.applicationId,
      Status: status,
      ManagerRemark: request.managerRemark,
      EmpId: request.empId,
      Name: request.name,
      LeaveType: request.leaveType,
      LeaveDuration: request.leaveDuration,
      StartDate: request.startDate,
      EndDate: request.endDate,
      description: request.description,
      to: request.to || '',
      cc: request.cc || '',
      leaveCount: request.leaveCount || 0,
      createdOn: request.createdOn
    };

    this.apiService.saveLeaveRequest(payload).subscribe({
      next: (response: any) => {
        // Update the status of the request
        request.status = status;
        this.isLoading = false;
        // Refresh the calendar view
        this.fetchLeaveRequestsCal();

        // Immediately refresh leave requests and notification count
        const userRole = (sessionStorage.getItem('userRole') || '').toLowerCase();
        if (userRole === 'admin') {
          this.fetchLeaveRequestsForAdmin();
        } else if (userRole === 'manager') {
          this.fetchLeaveRequestsForManager();
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.errorMessage = `Failed to ${status.toLowerCase()} leave request`;
        this.isLoading = false;
      }
    });
  }
  @ViewChild('employeeTable', { static: false }) employeeTable!: ElementRef;
  isManager: boolean = false;
  isAdmin: boolean = false;
  managerEmpId: string = '';
  adminEmpId: string = '';
  selectedEmployeeId: string = '';

  // Stub methods for manager/admin employee fetching
  fetchManagerEmployees(managerEmpId: string): void {
    // TODO: Implement actual logic or API call
  }
  fetchAdminEmployees(adminEmpId: string): void {
    // TODO: Implement actual logic or API call
  }
  // Fetch leave requests for managers under admin and their employees
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
            this.filterRequests();
            this.isLoading = false;
            this.AdminLeaveRequestCount(filteredData);
            console.log(filteredData);

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

  // Store the count of leave requests for admin
  public adminLeaveRequestCount: number = 0;
  private leaveNotificationService = inject(LeaveNotificationService);

  // Method to set the count of filteredData for admin
  AdminLeaveRequestCount(filteredData: any[]) {
  const pending = filteredData.filter((req: any) => req.status === 'Pending');
  this.adminLeaveRequestCount = pending.length;
  this.leaveNotificationService.setAdminPendingCount(this.adminLeaveRequestCount);
  console.log(this.adminLeaveRequestCount);
  }
  // Fetch leave requests for employees under the logged-in manager
  private apiService = inject(ApiService);

  allRequests: any[] = [];
  filteredRequests: any[] = [];
  searchText = '';
  isLoading = false;
  errorMessage = '';



  showTableView: boolean = true;

  // Add this method to toggle between views
  toggleView() {
    this.showTableView = !this.showTableView;
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    weekends: true,
    events: [],  // Initialize empty
    hiddenDays: [0],
  };

  ngOnInit(): void {
    this.fetchLeaveRequestsCal();
    const userRole = sessionStorage.getItem('userRole');
    const empId = sessionStorage.getItem('empId');

    if (userRole === 'Manager') {
      this.isManager = true;
      this.managerEmpId = empId || '';
      this.selectedEmployeeId = '';
      this.fetchLeaveRequestsForManager();
      this.fetchManagerEmployees(this.managerEmpId);
      this.isAdmin = false;
    } else if (userRole === 'Admin') {
      this.isAdmin = true;
      this.adminEmpId = empId || '';
      this.selectedEmployeeId = '';
      this.fetchLeaveRequestsForAdmin();
      this.fetchAdminEmployees(this.adminEmpId);
      this.isManager = false;
    } else {
      this.isManager = false;
      this.isAdmin = false;
    }
  }

  fetchLeaveRequestsCal() {
    this.apiService.getAllLeaveRequests().subscribe((data: any[]) => {
      const leaveEvents: EventInput[] = data.map(item => ({
        id: item.applicationId.toString(),
        title: `${item.leaveType} (${item.status})`,
        start: item.startDate,
        end: new Date(new Date(item.endDate).getTime() + 86400000).toISOString(), // Adjust end to be inclusive
        allDay: true,
        extendedProps: {
          empId: item.empId,
          name: item.name,
          description: item.description,
          managerRemark: item.managerRemark,
          status: item.status,
          originalStart: item.startDate,
          originalEnd: item.endDate
        }
      }));

      this.calendarOptions = {
        ...this.calendarOptions,
        events: leaveEvents,
        weekends: true,
        eventDidMount: (info) => {
          const props = info.event.extendedProps;
          const tooltip = `
          Name: ${props['name']}
          Dates: ${props['originalStart']} to ${props['originalEnd']}
          Type: ${info.event.title.split('(')[0].trim()}
          Status: ${props['status']}
          ${props['description'] ? `Description: ${props['description']}` : ''}
          ${props['managerRemark'] ? `Manager Remark: ${props['managerRemark']}` : ''}
        `;
          info.el.setAttribute('title', tooltip);
        }
      };
    });
  }

  // Helper function to get the next day (for inclusive end dates)
  private getNextDay(dateString: string): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
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
            this.filterRequests();
            this.isLoading = false;
              this.ManagerLeaveRequestCount(filteredData);
            console.log(filteredData);
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

   public managerLeaveRequestCount: number = 0;

  // Method to set the count of filteredData for manager
  ManagerLeaveRequestCount(filteredData: any[]) {
  const pending = filteredData.filter((req: any) => req.status === 'Pending');
  this.managerLeaveRequestCount = pending.length;
  this.leaveNotificationService.setManagerPendingCount(this.managerLeaveRequestCount);
  console.log('Manager pending leave count:', this.managerLeaveRequestCount);
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';

    // If already in YYYY-MM-DD format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    try {
      // Parse the date string while treating it as local time (not UTC)
      const date = new Date(dateString);

      // Handle invalid dates
      if (isNaN(date.getTime())) {
        return dateString.split('T')[0]; // Fallback to just the date part
      }

      // Format as YYYY-MM-DD without timezone conversion
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch {
      return dateString.split('T')[0]; // Fallback to just the date part
    }
  }

  downloadTableAsExcel(): void {
    // Export all records (including Pending), and remove Actions column
    const exportData = this.filteredRequests.map(r => ({
      'Emp ID': r.empId,
      'Name': r.name,
      'Leave Type': r.leaveType,
      'Start Date': this.formatDate(r.startDate),
      'End Date': this.formatDate(r.endDate),
      'Description': r.description,
      'Manager Remarks': r.managerRemark,
      'Status': r.status
    }));

    if (exportData.length === 0) {
      alert('No records to export.');
      return;
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
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
    anchor.download = `Leave_Request_${formattedDate}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }


  // Call this whenever searchText changes
  onSearchChange() {
    this.filterRequests();
  }

  filterRequests() {
    let filtered = [...this.allRequests];

    // Apply search filter if provided (case-insensitive, trims spaces)
    if (this.searchText && this.searchText.trim() !== '') {
      const searchTerm = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(request => {
        const name = request.name ? request.name.toLowerCase() : '';
        const empId = request.empId ? request.empId.toLowerCase() : '';
        return name.includes(searchTerm) || empId.includes(searchTerm);
      });
    }

    // Sort by createdOn descending (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdOn).getTime();
      const dateB = new Date(b.createdOn).getTime();
      return dateB - dateA;
    });

    this.filteredRequests = filtered;
  }

  openApproveModal(request: any) {
    this.approveRequest = request;
    this.modalAction = 'approve';
    this.showApproveModal = true;
  }

  closeApproveModal() {
    this.showApproveModal = false;
    this.approveRequest = null;
  }

  confirmModalAction() {
    if (this.approveRequest) {
      const status = this.modalAction === 'approve' ? 'Approved' : 'Rejected';
      this.updateLeaveStatus(this.approveRequest, status);
      this.closeApproveModal();
    }
  }
}

