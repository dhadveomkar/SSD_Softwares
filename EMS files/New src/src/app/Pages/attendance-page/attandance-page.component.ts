import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular'; // standalone FullCalendar wrapper
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import * as XLSX from 'xlsx';
import { ApiService } from '../../../services/services';

interface AttendanceRecord {
  date: string;
  shift: string;
  checkIns: string[];
  checkOuts: string[];
  description?: string;
  workingHours: string;
  status: string;
  empId: string;
  name: string;
  isAggregated: boolean;
  needsManagerApproval: boolean;
}


interface Holiday {
  holidayId: number;
  name: string;
  date: string;
  description: string;
}

interface LeaveRequest {
  leaveId: number;
  empId: string;
  name: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: string;
  managerRemark: string;
}

// FullCalendarModule.registerPlugins([
//   dayGridPlugin
// ]);

@Component({
  selector: 'app-attandance-page',
  standalone: true,
  imports: [FormsModule, CommonModule, FullCalendarModule, ToastModule],
  providers: [MessageService],
  templateUrl: './attandance-page.component.html',
  styleUrls: ['./attandance-page.component.css']
})
export class AttandancePageComponent implements OnInit {
  @ViewChild('employeeTable') employeeTable!: ElementRef;

  apiService = inject(ApiService);
  messageService = inject(MessageService);
  isLoading = false;
  errorMessage = '';
  searchText = '';
  filterDate = '';
  showCard = false;
  empId: string = '';
  firstName: string = '';
  middleName: string = '';
  lastName: string = '';

  pendingDates: string[] = [];
  showPendingForm = false;
  pendingSearchDate: string = '';
  filteredPendingDates: string[] = [];
  holidays: Holiday[] = [];

  user = {
    empId: '',
    name: ''
  };

  pendingAttendance = {
    date: '',
    shift: '',
    checkIn: '',
    checkOut: '',
    description: '',
  };

  todayAttendance = {
    shift: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    description: '',
    status: 'Pending',
    workingHours: '',
  };
  // Get only pending attendance requests for approval by reporting manager (not own requests)
  get filteredPendingApprovalRecords() {
    if (!this.attendanceHistory || this.attendanceHistory.length === 0) return [];
    return this.attendanceHistory.filter(record =>
      record.status === 'Pending' &&
      this.isManager &&
      record.empId !== this.managerEmpId &&
      this.employeesUnderManager.some(emp => emp.empId === record.empId)
    );
  }

  attendanceHistory: AttendanceRecord[] = [];
  showTableView: boolean = true;
  userData: any;

    isManager = false;
    isAdmin = false;
    managerEmpId = '';
    employeesUnderManager: any[] = [];
    selectedEmployeeId = '';  // For dropdown selection

  // Only reporting manager can approve/reject pending attendance
  canManagerApproveAttendance(record: AttendanceRecord): boolean {
    // Only allow if status is Pending, logged-in user is manager, and not the employee themselves
    return (
      record.status === 'Pending' &&
      this.isManager &&
      this.managerEmpId !== record.empId &&
      this.employeesUnderManager.some(emp => emp.empId === record.empId)
    );
  }

  ngOnInit() {
  this.loadUserData()
      const empId = sessionStorage.getItem('empId');
  const role = sessionStorage.getItem('userRole');



  if (role === 'Manager') {
    this.isManager = true;
    this.managerEmpId = empId || '';
    this.selectedEmployeeId = empId || ''; // Set self by default
    this.fetchManagerEmployees(this.managerEmpId);
    
  }
  else if(role === 'Admin'){
     this.isAdmin = true;
    this.managerEmpId = empId || '';
    this.selectedEmployeeId = empId || ''; // Set self by default
    this.fetchManagerEmployees(this.managerEmpId);
  }
   this.empId = sessionStorage.getItem('empId') || ''; 
    this.fetchAttendanceDataCal();
    this.fetchAttendanceData();


    // Load holidays first
    this.apiService.getAllHolidays().subscribe({
      next: (holidays) => {
        this.holidays = holidays;
        if (this.empId) {
          this.fetchAttendanceData();
        }
        this.fetchAttendanceDataCal();
      },
      error: (err) => console.error('Error loading holidays:', err)
    });
    
     this.resetAttendanceFields();

  }

   fetchManagerEmployees(managerEmpId: string) {
  this.apiService.getAllUsers().subscribe((users: any[]) => {
    const underManager = users.filter(user => user.reportingManager === managerEmpId);
    console.log(underManager);
    
    const selfUser = users.find(user => user.empId === managerEmpId);
    if (selfUser) {
      underManager.unshift(selfUser); // Add self at the top
    }

    this.employeesUnderManager = underManager;
  });
  console.log(this.employeesUnderManager);
  
}


  // Add this method to toggle between views
  toggleView() {
    this.showTableView = !this.showTableView;

  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    weekends: false,
    events: [],
    hiddenDays: [0], 
  };

   onEmployeeSelect() {
  if (this.selectedEmployeeId) {
    this.fetchAttendanceDataCal(this.selectedEmployeeId);
    this.fetchAttendanceData(this.selectedEmployeeId);
  }
}

  fetchAttendanceDataCal(empId?: string) {
     const targetEmpId = empId || this.empId;
    this.apiService.getAttendanceByEmpId(targetEmpId).subscribe((data: any[]) => {
      

      // Map API data into FullCalendar event format
      const calendarEvents = data.map(item => ({
        id: item.attendanceId,
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
        events: calendarEvents,  // update events from API
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



  loadUserData() {
    const empId = sessionStorage.getItem('empId');

    if (!empId) {
      console.warn('Emp ID missing');
      return;
    }

    this.apiService.getUserById(empId).subscribe({
      next: (response) => {
        this.userData = {
          empId: response.empId,
          firstName: response.firstName,
          middleName: response.middleName,
          lastName: response.lastName,

        };
        // Initialize these values for submission
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

  // In your fetchAttendanceData() method, modify the todayRecord logic:

  
  fetchAttendanceData(empId?: string, skipTodayAttendanceUpdate: boolean = false) {
    this.isLoading = true;
    const targetEmpId = empId || this.empId;
    this.apiService.getAttendanceByEmpId(targetEmpId).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.attendanceHistory = this.groupAndAggregateRecords(response);
          this.calculatePendingDates();
          this.countCheckInsAndOuts(this.attendanceHistory);

          // Always reset the form fields after fetching data (for reload)
          if (!skipTodayAttendanceUpdate) {
            this.resetTodayAttendanceFields();
          }

          if (response.length > 0) {
            this.user = {
              empId: response[0].empId || this.empId,
              name: response[0].name || 'Employee'
            };
          }
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching attendance:', err);
        this.errorMessage = err.error?.message || 'Failed to load attendance data';
        this.isLoading = false;
      }
    });
  }

  private countCheckInsAndOuts(records: AttendanceRecord[]) {
  let checkInCount = 0;
  let checkOutCount = 0;

  records.forEach(record => {
    checkInCount += record.checkIns.filter(ci => ci !== '--').length;
    checkOutCount += record.checkOuts.filter(co => co !== '--').length;
  });

  return { checkInCount, checkOutCount };
}

  // Modify the groupAndAggregateRecords method to properly handle status

  private groupAndAggregateRecords(records: any[]): AttendanceRecord[] {
    const dateGroups = new Map<string, AttendanceRecord>();

    records.forEach(record => {
      const dateKey = this.toLocalDateString(record.date);

      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, {
          date: record.date,
          shift: record.shift || '--',
          checkIns: [],
          checkOuts: [],
          description: record.description || '--',
          workingHours: record.workingHours || '--',
          status: record.status || 'Pending',
          empId: record.empId,
          name: record.name,
          isAggregated: false,
          needsManagerApproval: record.status === 'Pending'
        });
      }

      const existing = dateGroups.get(dateKey)!;
      if (record.checkIn) existing.checkIns.push(this.formatTimeForDisplay(record.checkIn));
      if (record.checkOut) existing.checkOuts.push(this.formatTimeForDisplay(record.checkOut));

      // Update status based on the most recent record's status
      existing.status = record.status || existing.status;

      existing.isAggregated = existing.checkIns.length > 1 || existing.checkOuts.length > 1;
      existing.needsManagerApproval = existing.status === 'Pending';

      // Recalculate working hours
      existing.workingHours = this.calculateWorkingHoursFromTimes(existing.checkIns, existing.checkOuts);
    });

    return Array.from(dateGroups.values());
  }

  private calculateWorkingHoursFromTimes(checkIns: string[], checkOuts: string[]): string {
    if (checkIns.length === 0) return '--';

    let totalMinutes = 0;
    const minPairs = Math.min(checkIns.length, checkOuts.length);

    for (let i = 0; i < minPairs; i++) {
      const checkIn = checkIns[i];
      const checkOut = checkOuts[i];

      if (checkIn === '--' || checkOut === '--') continue;

      try {
        const inTime = checkIn.split(' ');
        const [inHrs, inMins] = inTime[0].split(':').map(Number);
        const inPeriod = inTime[1];

        const outTime = checkOut.split(' ');
        const [outHrs, outMins] = outTime[0].split(':').map(Number);
        const outPeriod = outTime[1];

        const in24Hrs = inPeriod === 'PM' && inHrs !== 12 ? inHrs + 12 : inHrs;
        const out24Hrs = outPeriod === 'PM' && outHrs !== 12 ? outHrs + 12 : outHrs;

        const checkInMinutes = in24Hrs * 60 + inMins;
        const checkOutMinutes = out24Hrs * 60 + outMins;

        let timeDiff = checkOutMinutes - checkInMinutes;
        if (timeDiff < 0) timeDiff += 1440;

        totalMinutes += timeDiff;
      } catch (e) {
        console.error('Error calculating time difference:', e);
      }
    }

    if (totalMinutes <= 0) return '--';

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  // private toLocalDateString(date: string | Date): string {
  //   if (!date) return '';
  //   if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  //   const d = new Date(date);
  //   if (isNaN(d.getTime())) return '';

  //   const year = d.getUTCFullYear();
  //   const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  //   const day = d.getUTCDate().toString().padStart(2, '0');

  //   return `${year}-${month}-${day}`;
  // }
  toLocalDateString(date: string | Date): string {
    // const d = new Date(date);
    // console.log(d.toISOString().split('T')[0]);
    // return d.toISOString().split('T')[0]; // returns 'YYYY-MM-DD'

    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    // Local date components
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  private formatTimeForDisplay(isoTime: string): string {
    if (!isoTime) return '--';
    try {
      const date = new Date(isoTime);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      console.error('Error formatting time:', e);
      return '--';
    }
  }

  private formatTimeForInput(isoTime: string): string {
    if (!isoTime) return '';
    const date = new Date(isoTime);
    if (isNaN(date.getTime())) return '';

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

private calculatePendingDates() {
  // Get all attended dates in local format
  const attendedDates = this.attendanceHistory.map(record =>
    this.toLocalDateString(record.date)
  );

  // Get holiday dates from service
  const holidayDates = this.holidays?.map(holiday =>
    holiday.date.split('T')[0]
  ) || [];

  // Get leave requests for this specific employee
  this.apiService.getLeaveRequestByEmpId(this.empId).subscribe({
    next: (leaveRequests: LeaveRequest[]) => {
      // Filter approved leave requests
      const approvedLeaves = leaveRequests.filter(leave => 
        leave.status === 'Approved'
      );

      // Get all dates covered by approved leaves
      const leaveDates: string[] = [];
      approvedLeaves.forEach(leave => {
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        
        // Add all dates in the leave range
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          leaveDates.push(this.toLocalDateString(d));
        }
      });

      // Generate all dates in the current year
      const allYearDates: string[] = [];
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 0, 1); // January 1st
      const endDate = new Date(currentYear, 11, 31); // December 31st

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Skip weekends (0=Sunday, 6=Saturday)
        if (d.getDay() !== 0 && d.getDay() !== 6) {
          allYearDates.push(this.toLocalDateString(d));
        }
      }

      // Filter out:
      this.pendingDates = allYearDates.filter(date => {
        return !attendedDates.includes(date) && // Not already attended
               !holidayDates.includes(date) && // Not a holiday
               !leaveDates.includes(date) &&    // Not an approved leave day
               date !== this.toLocalDateString(new Date()); // Not today
      }).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      this.filteredPendingDates = [...this.pendingDates];
    },
    error: (err) => {
      console.error('Error fetching leave requests:', err);
      // Fall back to calculation without leave dates
      this.calculatePendingDatesWithoutLeaves(attendedDates, holidayDates);
    }
  });
}

// Fallback method if leave requests fail to load
private calculatePendingDatesWithoutLeaves(attendedDates: string[], holidayDates: string[]) {
  // Generate all dates in the current year
  const allYearDates: string[] = [];
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1); // January 1st
  const endDate = new Date(currentYear, 11, 31); // December 31st

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    allYearDates.push(this.toLocalDateString(d));
  }

  // Filter out:
  this.pendingDates = allYearDates.filter(date => {
    const dayOfWeek = new Date(date).getDay();
    return !attendedDates.includes(date) &&
      !holidayDates.includes(date) &&
      date !== this.toLocalDateString(new Date()) &&
      dayOfWeek !== 0; // Exclude Sundays
  }).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  this.filteredPendingDates = [...this.pendingDates];
}

  filterPendingDates() {
    if (!this.pendingSearchDate) {
      this.filteredPendingDates = [...this.pendingDates];
      return;
    }

    this.filteredPendingDates = this.pendingDates.filter(date =>
      date === this.pendingSearchDate
    );
  }

  loadPendingForm(date: string) {
    this.showPendingForm = true;
    this.pendingAttendance = {
      date: date,
      shift: '',
      checkIn: '',
      checkOut: '',
      description: ''
    };
  }

  cancelPendingForm() {
    this.showPendingForm = false;
  }

  submitPendingAttendance() {
    if (!this.pendingAttendance.shift) {
      this.showToast('Please select shift');
      return;
    }
    if (!this.pendingAttendance.date || !this.pendingAttendance.checkIn || !this.pendingAttendance.checkOut) {
      this.errorMessage = 'Please fill all required fields';
      this.showToast(this.errorMessage);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formattedDate = this.pendingAttendance.date;
    const checkInISO = `${formattedDate}T${this.pendingAttendance.checkIn}:00Z`;
    const checkOutISO = `${formattedDate}T${this.pendingAttendance.checkOut}:00Z`;

    const checkInDate = new Date(checkInISO);
    const checkOutDate = new Date(checkOutISO);
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const workingHours = `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:00`;

    const payload = {
      attendanceId: 0,
      empId: this.userData.empId, // Use userData directly
      name: `${this.userData.firstName} ${this.userData.middleName || ''} ${this.userData.lastName}`.trim(),
      shift: this.pendingAttendance.shift,
      date: formattedDate,
      checkIn: checkInISO,
      checkOut: checkOutISO,
      workingHours: workingHours,
      description: this.pendingAttendance.description || null,
      managerRemark: null,
      status: 'Pending'
    };

    this.apiService.saveAttendance(payload).subscribe({
      next: (response) => {
        this.fetchAttendanceData();
        this.showPendingForm = false;
        this.resetPendingForm();
        this.isLoading = false; this.showToastSuccess('Attendance saved successfully!');
       
        
      },
      error: (err) => {
        console.error('Error submitting pending attendance:', err);
        this.errorMessage = err.error?.message || 'Failed to submit pending attendance';
        this.isLoading = false;
      }
    });
  }

  submitTodayAttendance() {

    if (!this.todayAttendance.shift) {
      this.showToast('Please fill Shift');
      return;
    }
    if (!this.todayAttendance.checkIn) {
      this.showToast('Please fill Check In');
      return;
    }
    if (!this.todayAttendance.checkOut) {
      this.showToast('Please fill Check Out');
      return;
    }

    this.isLoading = true;

    const todayDateString = this.toLocalDateString(new Date());

    const existingRecords = this.attendanceHistory.filter(record =>
      this.toLocalDateString(record.date) === todayDateString
    );

    // Calculate working hours for status logic
    let status = 'Present';
    let workingHoursStr = this.todayAttendance.checkOut
      ? this.calculateWorkingHours(this.todayAttendance.checkIn, this.todayAttendance.checkOut)
      : '00:00:00';

    // Convert workingHoursStr to minutes for comparison
    let totalMinutes = 0;
    if (workingHoursStr && workingHoursStr !== '00:00:00') {
      const match = workingHoursStr.match(/(\d+)h\s*(\d+)m/);
      if (match) {
        totalMinutes = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
      } else {
        // fallback for HH:MM:SS format
        const parts = workingHoursStr.split(':');
        if (parts.length >= 2) {
          totalMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        }
      }
    }

    if (totalMinutes < 510) { // 8h 30m = 510 minutes
      status = 'Pending';
    } else if (existingRecords.length > 0) {
      status = 'Pending';
    } else if (!this.todayAttendance.checkOut) {
      status = 'Checked In';
    }

    const payload = {
      attendanceId: 0,
      empId: this.empId,
      // name: this.user.name || 'Employee',
      name: `${this.userData.firstName} ${this.userData.middleName || ''} ${this.userData.lastName}`.trim(),
      shift: this.todayAttendance.shift,
      date: `${this.todayAttendance.date}T00:00:00`,
      checkIn: `${this.todayAttendance.date}T${this.todayAttendance.checkIn}:00`,
      checkOut: this.todayAttendance.checkOut
        ? `${this.todayAttendance.date}T${this.todayAttendance.checkOut}:00`
        : null,
      workingHours: workingHoursStr,
      description: this.todayAttendance.description || null,
      managerRemark: null,
      status: status
    };


    this.apiService.saveAttendance(payload).subscribe({
      next: () => {
        // Refresh table and calendar, but do not update today's form fields
        this.fetchAttendanceData(undefined, true);
        this.fetchAttendanceDataCal();
        this.isLoading = false;
        this.resetTodayAttendanceFields();
        this.showToastSuccess('Request sent successfully');
        this.resetAttendanceFields();
      },
      error: (err) => {
        console.error('Error saving attendance:', err);
        this.errorMessage = err.error?.message || 'Failed to send request';
        this.isLoading = false;
        this.resetTodayAttendanceFields();
        this.showToast('Failed to send request');
      }
    });
  }

  // Toast message utility using PrimeNG Toast
 showToast(message: string) {
  this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
 }

 showToastSuccess(message: string) {
   this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
 }


  private calculateWorkingHours(checkIn: string, checkOut: string): string {
    const [inHrs, inMins] = checkIn.split(':').map(Number);
    const [outHrs, outMins] = checkOut.split(':').map(Number);

    const totalInMinutes = inHrs * 60 + inMins;
    const totalOutMinutes = outHrs * 60 + outMins;
    const diffMinutes = totalOutMinutes - totalInMinutes;

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  }

    private resetAttendanceFields() {
      this.todayAttendance.shift = '';
      this.todayAttendance.checkIn = '';
      this.todayAttendance.checkOut = '';
      this.todayAttendance.description = '';
    }


  private resetTodayAttendanceFields() {
    this.todayAttendance = {
      shift: '',
      date: new Date().toISOString().split('T')[0],
      checkIn: '',
      checkOut: '',
      description: '',
      status: 'Pending',
      workingHours: ''
    };
  }


  private resetPendingForm() {
    this.pendingAttendance = {
      date: '',
      shift: '',
      checkIn: '',
      checkOut: '',
      description: ''
    };
  }

  downloadTableAsExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.employeeTable.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    // Format current date as YYYY-MM-DD
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    XLSX.writeFile(wb, `Attendance_Records_${formattedDate}.xlsx`);
  }

  get filteredRecords() {
    if (!this.attendanceHistory || this.attendanceHistory.length === 0) return [];

    return this.attendanceHistory.filter(record => {
      const shiftMatch = !this.searchText ||
        (record.shift && record.shift.toLowerCase().includes(this.searchText.toLowerCase()));
      const dateMatch = !this.filterDate ||
        this.toLocalDateString(record.date) === this.filterDate;
      return shiftMatch && dateMatch;
    });
  }
}