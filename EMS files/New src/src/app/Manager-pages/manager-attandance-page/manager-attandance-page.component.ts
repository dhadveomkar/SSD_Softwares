import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';
import { ApiService } from '../../../services/services';

interface ManagerAttendanceRecord {
  attendanceId: number;
  empId: string;
  name: string;
  shift: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  description: string;
  managerRemark: string;
  status: string;
  isAggregated: boolean;
  checkIns: string[];
  checkOuts: string[];
  originalRecords: any[];
}

@Component({
  selector: 'app-manager-attandance-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule, ToastModule],
  templateUrl: './manager-attandance-page.component.html',
  styleUrls: ['./manager-attandance-page.component.css']
})
export class ManagerAttendancePageComponent implements OnInit {
  messageService = inject(MessageService);
  apiService = inject(ApiService);
  searchText = '';
  filterDate = '';
  attendanceRecords: any[] = [];
  isLoading = false;
  errorMessage = '';
  showTableView: boolean = true;
  attendanceResponse: any[] = [];
  isManager = false;
  isAdmin = false;
  managerEmpId = '';
  adminEmpId = '';
  employeesUnderManager: any[] = [];
  selectedEmployeeId = '';

  constructor() { }

  // ngOnInit(): void {
  //   this.fetchAttendancesCal();
  //   this.fetchAttendances();
  //   this.fetchAttendancesForAdmin();


  // }
  ngOnInit(): void {
    this.fetchAttendancesCal();
    const userRole = sessionStorage.getItem('userRole');
    if (userRole === 'Manager') {
      this.fetchAttendances();
    } else if (userRole === 'Admin') {
      this.fetchAttendancesForAdmin();
    }

    const empId = sessionStorage.getItem('empId');
    const role = sessionStorage.getItem('userRole');

    if (role === 'Manager') {
      this.isManager = true;
      this.managerEmpId = empId || '';
      this.selectedEmployeeId = ''; // Set self by default
      this.fetchManagerEmployees(this.managerEmpId);
    }
    this.isAdmin = true;
    this.adminEmpId = empId || '';
    this.selectedEmployeeId = ''; // Set self by default
    this.fetchAdminEmployees(this.adminEmpId);
  }

  toggleView() {
    this.showTableView = !this.showTableView;
  }

  //Ankita Panchal Date: 27 Aug 2025
  // Fetch employees under manager
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

fetchAdminEmployees(adminEmpId: string) {
  this.apiService.getAllUsers().subscribe((users: any[]) => {
    // Find managers under this admin
    const managers = users.filter(user => user.managerId === adminEmpId);
    console.log(managers);
    
    // Find employees under each manager
    let employees: any[] = [];
    managers.forEach(manager => {
      // Get employees whose managerId or reportingManager matches manager's empId
      const underManager = users.filter(user =>
        user.managerId === manager.empId || user.reportingManager === manager.empId
      );
      employees = employees.concat(underManager);
    });

    // Remove duplicate employees (if any)
    const uniqueEmployees = employees.filter(
      (emp, idx, arr) => arr.findIndex(e => e.empId === emp.empId) === idx
    );

    // Combine managers and their employees
    const combinedList = [...managers, ...uniqueEmployees];

    this.employeesUnderManager = combinedList;
    console.log(this.employeesUnderManager);
  });
}

  // Handle employee selection
  onEmployeeSelect() {
    if (this.selectedEmployeeId) {
      this.fetchAttendanceDataCal(this.selectedEmployeeId);
      this.fetchAttendanceData(this.selectedEmployeeId);
    }
  }

// Fetch calendar events for selected employee
fetchAttendanceDataCal(empId: string) {
  this.apiService.getAttendanceByEmpId(empId).subscribe((data: any[]) => {
    const calendarEvents = data.map(item => ({
      id: item.attendanceId.toString(),
      title: `${item.status} (${item.shift})`,
      start: item.checkIn,
      end: item.checkOut,
      extendedProps: {
        empId: item.empId,
        name: item.name,
        workingHours: item.workingHours,
        description: item.description,
        managerRemark: item.managerRemark
      }
    }));

    this.calendarOptions = {
      ...this.calendarOptions,
      events: calendarEvents,
      weekends: true,
      eventDidMount: (info) => {
        const props = info.event.extendedProps;
        let tooltip = `
          Name: ${props['name']}
          Employee ID: ${props['empId']}
          Shift: ${props['shift']}
          Working Hours: ${props['workingHours']}
          Description: ${props['description'] || 'N/A'}
          Manager Remark: ${props['managerRemark'] || 'N/A'}
          Status: ${info.event.title}
        `;
        info.el.setAttribute('title', tooltip);
      }
    };
  });
}

// Fetch attendance records for selected employee
fetchAttendanceData(empId: string) {
  this.isLoading = true;
  this.apiService.getAttendanceByEmpId(empId).subscribe({
    next: (data: any[]) => {
      const groupedRecords = this.groupRecords(data);
      const allRecords = Array.from(groupedRecords.values())
        .flatMap(group => this.createManagerRecordsFromGroup(group));
      this.attendanceRecords = allRecords;
      this.countCheckInsAndOuts(allRecords);
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Error fetching attendance:', err);
      this.errorMessage = 'Failed to load attendance data';
      this.isLoading = false;
    }
  });
}

//Ankita's code Ends here

  fetchAttendancesCal() {
    this.apiService.getAllAttendances().subscribe((data: any[]) => {
      // Map API data into FullCalendar event format
      const calendarEvents = data.map(item => ({
        id: item.attendanceId.toString(),
        title: `${item.status} (${item.shift})`,
        start: item.checkIn,
        end: item.checkOut,
        extendedProps: {
          empId: item.empId,
          name: item.name,
          workingHours: item.workingHours,
          description: item.description,
          managerRemark: item.managerRemark
        }
      }));

      // Dynamically update the calendar events
      this.calendarOptions = {
        ...this.calendarOptions, // keep other settings
        events: calendarEvents,   // update events from API
        weekends: true,
        eventDidMount: (info) => {
          const props = info.event.extendedProps;

          let tooltip = '';

          if (props['attendanceId']) {
            // Tooltip for attendance events
            tooltip = `
            Name: ${props['name']}
            Employee ID: ${props['empId']}
            Shift: ${props['shift']}
            Date: ${props['date']}
            Check In: ${props['checkIn']}
            Check Out: ${props['checkOut']}
            Working Hours: ${props['workingHours']}
            Description: ${props['description'] || 'N/A'}
            Manager Remark: ${props['managerRemark'] || 'N/A'}
            Status: ${info.event.title}
                  `;
          } else {
            // Tooltip for leave events (original)
            tooltip = `
            Name: ${props['name']}
            Description: ${props['description']}
            Manager Remark: ${props['managerRemark']}
            Status: ${info.event.title}
           `;
          }

          info.el.setAttribute('title', tooltip);
        }
      };
    });
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    weekends: false,
    events: [],
    hiddenDays: [0],
  };

  downloadTableAsExcel(table: HTMLElement): void {
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
    anchor.download = `Attendance_Requests_${formattedDate}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  fetchAttendances() {
    this.isLoading = true;
    this.errorMessage = '';

    // Get logged-in manager's empId
    const managerEmpId = sessionStorage.getItem('empId');
    if (!managerEmpId) {
      this.errorMessage = 'Manager ID not found.';
      this.isLoading = false;
      return;
    }

    // Step 1: Get all users and filter employees under this manager
    this.apiService.getAllUsers().subscribe({
      next: (users: any[]) => {
        // Get all empIds where managerId matches logged-in manager
        const managedEmpIds = users
          .filter(user => user.managerId === managerEmpId)
          .map(user => user.empId);

        if (managedEmpIds.length === 0) {
          this.attendanceRecords = [];
          this.isLoading = false;
          return;
        }

        // Step 2: Get all attendances and filter for managed employees
        this.apiService.getAllAttendances().subscribe({
          next: (data: any[]) => {
            // Only include attendance records for managed employees
            const filteredData = data.filter(record => managedEmpIds.includes(record.empId));

            const groupedRecords = this.groupRecords(filteredData);
            const allRecords = Array.from(groupedRecords.values())
              .flatMap(group => this.createManagerRecordsFromGroup(group));
            // Show ALL records, not just pending
            this.attendanceRecords = allRecords;
            this.countCheckInsAndOuts(allRecords);
            this.isLoading = false;
            console.log(allRecords);

          },

          error: (err) => {
            console.error('Error fetching attendances:', err);
            this.errorMessage = 'Failed to load attendance data';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.errorMessage = 'Failed to load user data';
        this.isLoading = false;
      }
    });
  }

  fetchAttendancesForAdmin() {
    this.isLoading = true;
    this.errorMessage = '';

    // Get logged-in admin's empId
    const adminEmpId = sessionStorage.getItem('empId');
    if (!adminEmpId) {
      this.errorMessage = 'Admin ID not found.';
      this.isLoading = false;
      return;
    }

    // Step 1: Get all users
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

        // Combine manager and employee empIds
        const allEmpIds = [...managerEmpIds, ...employeeEmpIds];

        if (allEmpIds.length === 0) {
          this.attendanceRecords = [];
          this.isLoading = false;
          return;
        }

        // Step 2: Get all attendances and filter for these empIds
        this.apiService.getAllAttendances().subscribe({
          next: (data: any[]) => {
            // Only include attendance records for managers and their employees
            const filteredData = data.filter(record => allEmpIds.includes(record.empId));
            const groupedRecords = this.groupRecords(filteredData);
            const allRecords = Array.from(groupedRecords.values())
              .flatMap(group => this.createManagerRecordsFromGroup(group));
            console.log(allRecords);

            // Show ALL records, not just pending
            this.attendanceRecords = allRecords;
            this.countCheckInsAndOuts(allRecords);
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching attendances:', err);
            this.errorMessage = 'Failed to load attendance data';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.errorMessage = 'Failed to load user data';
        this.isLoading = false;
      }
    });
  }
  private countCheckInsAndOuts(records: ManagerAttendanceRecord[]) {
    let checkInCount = 0;
    let checkOutCount = 0;

    records.forEach(record => {
      checkInCount += record.checkIns.filter(ci => ci !== 'N/A').length;
      checkOutCount += record.checkOuts.filter(co => co !== 'N/A').length;
    });

    return { checkInCount, checkOutCount };
  }

  private groupRecords(records: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>();

    records.forEach(record => {
      const recordDate = record.rawDate || this.formatDateWithoutTimezone(record.date);
      const key = `${record.empId}-${recordDate}`;

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)?.push(record);
    });

    return groups;
  }

  private createManagerRecordsFromGroup(group: any[]): ManagerAttendanceRecord[] {
    if (group.length === 0) return [];

    // Sort records chronologically
    group.sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());

    const firstRecord = group[0];
    const checkIns = group.map(r => r.checkIn ? this.formatTime(r.checkIn) : 'N/A');
    const checkOuts = group.map(r => r.checkOut ? this.formatTime(r.checkOut) : 'N/A');

    // Calculate total hours
    const workHours = this.calculateTotalHours(group);

    // Determine status
    let status = firstRecord.status;
    if (group.length > 1) {
      const allPresent = group.every(r => r.status === 'Present');
      const allAbsent = group.every(r => r.status === 'Absent');
      if (allPresent) {
        status = 'Present';
      } else if (allAbsent) {
        status = 'Absent';
      } else {
        status = 'Pending';
      }
    } else if (!firstRecord.checkIn) {
      status = 'Absent';
    } else if (!firstRecord.checkOut) {
      status = 'Checked In';
    } else {
      status = status || 'Pending';
    }

    return [{
      attendanceId: firstRecord.attendanceId,
      empId: firstRecord.empId,
      name: firstRecord.name,
      shift: firstRecord.shift,
      date: this.formatDateWithoutTimezone(firstRecord.date),
      checkIn: checkIns.join('\n'),
      checkOut: checkOuts.join('\n'),
      workHours: workHours,
      description: group.map(r => r.description).filter(d => d).join('\n'),
      managerRemark: firstRecord.managerRemark || '',
      status: status,
      isAggregated: group.length > 1,
      checkIns: checkIns,
      checkOuts: checkOuts,
      originalRecords: group
    }];
  }

  private determineGroupStatus(group: any[]): string {
    // For multiple records, always return Pending
    if (group.length > 1) return 'Pending';

    // For single record
    const record = group[0];
    if (!record.checkIn) return 'Absent';
    if (!record.checkOut) return 'Checked In';
    return record.status || 'Pending'; // Default to Pending if no status exists
  }

  private calculateTotalHours(records: any[]): string {
    let totalMs = 0;
    records.forEach(record => {
      if (record.checkIn && record.checkOut) {
        totalMs += new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime();
      }
    });
    return totalMs > 0 ? this.formatHoursMinutes(totalMs) : 'N/A';
  }

  private formatHoursMinutes(totalMs: number): string {
    const totalSeconds = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  private formatDateWithoutTimezone(dateString: string): string {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) return `${parts[0]}-${parts[1]}-${parts[2]}`;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private formatTime(dateTime: string): string {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return 'N/A';

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  onSearchChange() {
    this.filterRecords();
  }

  filterRecords() {
    // Show ALL records, not just pending
    let filtered = this.attendanceRecords;

    // Then apply search filters
    if (this.searchText) {
      const searchTerm = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(record =>
        record.name.toLowerCase().includes(searchTerm) ||
        record.empId.toLowerCase().includes(searchTerm)
      );
    }

    // Apply date filter if specified
    if (this.filterDate) {
      filtered = filtered.filter(record => record.date === this.filterDate);
    }

    return filtered;
  }

  approveAttendance(record: ManagerAttendanceRecord) {
    if (!confirm(`Approve attendance record for ${record.name}?`)) return;
    this.updateAttendanceStatus(record, 'Present', record.managerRemark || 'Approved by manager');
  }

  showToastSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Attendance Approved',
      detail: message
    });
  }

  rejectAttendance(record: ManagerAttendanceRecord) {
    if (!confirm(`Reject attendance record for ${record.name}?`)) return;
    this.updateAttendanceStatus(record, 'Absent', record.managerRemark || 'Rejected by manager');
  }

  private updateAttendanceStatus(record: ManagerAttendanceRecord, newStatus: string, remark: string) {
    this.isLoading = true;

    const updates = record.originalRecords.map(originalRecord => ({
      ...originalRecord,
      status: newStatus,
      managerRemark: remark
    }));

    forkJoin(updates.map(u => this.apiService.saveAttendance(u))).subscribe({
      next: () => {
        // Update the record in the current view instead of removing it
        const updatedRecord = {
          ...record,
          status: newStatus,
          managerRemark: remark
        };

        // Find and update the record in the array
        const index = this.attendanceRecords.findIndex(r =>
          r.empId === record.empId && r.date === record.date
        );

        if (index !== -1) {
          this.attendanceRecords[index] = updatedRecord;
        }

        // Refresh the calendar view
        this.fetchAttendancesCal();
        this.fetchAttendancesForAdmin();

        this.isLoading = false;

        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Attendance ${newStatus === 'Present' ? 'approved' : 'rejected'} successfully`
        });
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.errorMessage = `Failed to ${newStatus === 'Present' ? 'approve' : 'reject'} attendance`;
        this.isLoading = false;

        // Show error message
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.errorMessage
        });
      }
    });
  }

  private createPayload(record: any, status: string, remark: string) {
    return {
      ...record,
      status: status,
      managerRemark: remark,
      empId: record.empId,
      name: record.name,
      date: record.date,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      workingHours: record.workingHours
    };
  }
}