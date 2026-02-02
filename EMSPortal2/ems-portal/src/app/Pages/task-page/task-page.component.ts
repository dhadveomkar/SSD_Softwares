// Getter for selected employee name
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import * as XLSX from 'xlsx';
import { ApiService } from '../../../services/services';

interface Task {
  taskId?: number;
  taskDetails: string;
  startDate: string;
  endDate: string;
  estimatedHours: number | null;
  completedInHours: number | null;
  status: string;
  comment: string;
  isEditing?: boolean;
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

@Component({
  selector: 'app-task-page',
  standalone: true,
  imports: [FormsModule, CommonModule, FullCalendarModule, ToastModule],
  templateUrl: './task-page.component.html',
  styleUrl: './task-page.component.css'
})
export class TaskPageComponent {
  // Track dropdown open state
  employeeDropdownOpen: boolean = false;

  // Listen for outside click to close dropdown
  ngAfterViewInit() {
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', this.handleOutsideClick);
    }
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousedown', this.handleOutsideClick);
    }
  }

  handleOutsideClick = (event: MouseEvent) => {
    if (typeof document === 'undefined') return;
    const input = document.getElementById('employeeSearchInput');
    const dropdown = document.querySelector('.employee-options-scroll');
    if (!input || !dropdown) return;
    if (
      !input.contains(event.target as Node) &&
      !dropdown.contains(event.target as Node)
    ) {
      this.employeeDropdownOpen = false;
      this.filteredEmployeeOptions = [];
    }
  };
  employeeSearchText: string = '';
  filteredEmployeeOptions: { empId: string, name: string }[] = [];

  // Filter employee options as user types
  filterEmployeeOptions() {
    const search = this.employeeSearchText.trim().toLowerCase();
    this.employeeDropdownOpen = true;
    if (!search) {
      this.filteredEmployeeOptions = [...this.nameList];
      return;
    }
    // Filter and format names to show only first and last name
    this.filteredEmployeeOptions = this.nameList
      .filter(user => user.name.toLowerCase().includes(search))
      .map(user => {
        const nameParts = user.name.trim().split(' ');
        let displayName = '';
        if (nameParts.length === 1) {
          displayName = nameParts[0];
        } else if (nameParts.length === 2) {
          displayName = `${nameParts[0]} ${nameParts[1]}`;
        } else if (nameParts.length > 2) {
          displayName = `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
        }
        return { ...user, name: displayName };
      });
  }

  // Select employee from autocomplete
  selectEmployeeOption(user: { empId: string, name: string }) {
    this.selectedEmployeeId = user.empId;
    this.employeeSearchText = user.name;
    this.filteredEmployeeOptions = [];
    this.getSelectedEmployeeDailyTask();
  }

  // Getter for selected employee name
  get selectedEmployeeName(): string {
    if (!this.selectedEmployeeId) return '';
    const user = this.nameList.find((u: { empId: string; name: string }) => u.empId === this.selectedEmployeeId);
    return user ? user.name : '';
  }
  nameList: { empId: string, name: string }[] = [];
  /**
   * Fetches all users and returns a list of their full names.
   * @returns Promise<string[]>
   */

  myAllTasks: any[] = [];
  myToDoTasks: any[] = [];
  myPendingTasks: any[] = [];
  myCompleteTasks: any[] = [];

  todoTasks: { taskDetails: string; startDate: string; estimatedHours: number | null }[] = [];

  isHoliday(date: string): boolean {
    return this.holidays.some(h => h.date.split('T')[0] === date);
  }

  onStartDateInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input || typeof input.value !== 'string') return;
    let value = input.value;
    // Only allow yyyy-MM-dd, block if year > 4 digits
    const match = value.match(/^(\d{4})(\d*)-(\d{0,2})-(\d{0,2})$/);
    if (match && match[2] && match[2].length > 0) {
      // Remove extra digits from year
      value = match[1] + '-' + match[3] + '-' + match[4];
      input.value = value;
    }
    // Update modalTask.startDate if used in modal
    if (this.modalTask) {
      this.modalTask.startDate = input.value;
    }
  }

  onEndDateInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input || typeof input.value !== 'string') return;
    let value = input.value;
    // Only allow yyyy-MM-dd, block if year > 4 digits
    const match = value.match(/^(\d{4})(\d*)-(\d{0,2})-(\d{0,2})$/);
    if (match && match[2] && match[2].length > 0) {
      // Remove extra digits from year
      value = match[1] + '-' + match[3] + '-' + match[4];
      input.value = value;
    }
    // Update modalTask.startDate if used in modal
    if (this.modalTask) {
      this.modalTask.endDate = input.value;
    }
  }

  onStartDateChange(task: Task) {
    if (task.startDate && this.isHoliday(task.startDate)) {
      this.showToastError('Selected start date is an official holiday');
      task.startDate = '';
    }
  }

  onEndDateChange(task: Task) {
    if (!task.startDate) {
      this.showToastError('Please select start date first');
      task.endDate = '';
      return;
    }
    if (task.endDate && this.isHoliday(task.endDate)) {
      this.showToastError('Selected end date is an official holiday');
      task.endDate = '';
    }
  }
  tasks: Task[] = [];
  selectedIndex: number | null = null;
  taskList: Task[] = [];
  showTaskList: boolean = false;
  showCard = false;
  empId: string = '';
  firstName: string = '';
  middleName: string = '';
  lastName: string = '';
  pendingSearchDate: string = '';
  isLoading = false;
  errorMessage = '';
  apiService = inject(ApiService);
  messageService = inject(MessageService);
  userData: any;
  showPendingTaskForm = false;
  pendingDates: string[] = [];
  filteredPendingDates: string[] = [];
  currentYearDates: string[] = [];
  holidays: Holiday[] = [];

  showCalendar = false;

  isManager = false;
  managerEmpId = '';
  employeesUnderManager: any[] = [];
  selectedEmployeeId: string = '';

  constructor() {
    this.addRow();
  }

  // Download all task details as Excel
  downloadTasksAsExcel() {
    // Prepare data for Excel
    const data = this.myAllTasks.map(task => ({
      'Task Details': task.taskDetails,
      'Start Date': task.startDate ? task.startDate.split('T')[0] : '',
      'End Date': task.endDate ? task.endDate.split('T')[0] : '',
      'Estimated Hours': task.estimatedHours,
      'Completed In Hours': task.completedInHours,
      'Status': task.status,
      'Comment': task.comment
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
    // Format current date as YYYY-MM-DD
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    XLSX.writeFile(wb, `Task_Details_${formattedDate}.xlsx`);
  }

  todayAttendance = {
    date: new Date().toISOString().split('T')[0],
  };

  ngOnInit(): void {
    // Initialize filteredEmployeeOptions for autocomplete
    this.filteredEmployeeOptions = [...this.nameList];
    this.loadUserData();
    this.generateYearDates();
    this.loadHolidays(); // Load holidays first
    this.getAllDailyTasksForAllEmployees();

    // Get login user info
    const empId = sessionStorage.getItem('empId');
    const role = sessionStorage.getItem('userRole');

    if (role === 'Admin') {
      // Admin: show self, all managers under admin, and all employees under those managers
      this.apiService.getAllUsers().subscribe((users: any[]) => {
        // Find admin (self)
        const selfUser = users.find(user => user.empId === empId);
        // Find managers under admin
        const managers = users.filter(user => user.reportingManager === empId && user.role === 'Manager');
        // Find employees under each manager
        let nameList: { empId: string, name: string }[] = [];
        if (selfUser) {
          nameList.push({ empId: selfUser.empId, name: [selfUser.firstName, selfUser.middleName, selfUser.lastName].filter(Boolean).join(' ') });
        }
        managers.forEach(manager => {
          nameList.push({ empId: manager.empId, name: [manager.firstName, manager.middleName, manager.lastName].filter(Boolean).join(' ') });
          // Employees under this manager
          const employees = users.filter(user => user.reportingManager === manager.empId && user.role === 'User');
          employees.forEach(emp => {
            nameList.push({ empId: emp.empId, name: [emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(' ') });
          });
        });
        this.nameList = nameList;
        this.selectedEmployeeId = empId || '';
      });
    } else if (role === 'Manager') {
      // Manager: show self and employees under manager
      this.apiService.getAllUsers().subscribe((users: any[]) => {
        const selfUser = users.find(user => user.empId === empId);
        const underManager = users.filter(user => user.reportingManager === empId && user.role === 'Employee');
        const nameList: { empId: string, name: string }[] = [];
        if (selfUser) {
          nameList.push({ empId: selfUser.empId, name: [selfUser.firstName, selfUser.middleName, selfUser.lastName].filter(Boolean).join(' ') });
        }
        underManager.forEach(user => {
          nameList.push({ empId: user.empId, name: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') });
        });
        this.nameList = nameList;
        this.selectedEmployeeId = empId || '';
      });
    } else {
      // Employee: only self
      this.apiService.getUserById(empId || '').subscribe((user: any) => {
        this.nameList = [{ empId: user.empId, name: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') }];
        this.selectedEmployeeId = user.empId;
      });
    }
    console.log("role: ", role, "empId: ", empId);
  }

  modalTask = {
    taskDetails: '',
    startDate: '',
    endDate: '',
    estimatedHours: null as number | null,
    completedInHours: null as number | null,
    status: '',
    comment: ''
  };

  isModalReadOnly = false;
  isEditMode = false;

  openTaskDetailsModal(task: any) {
    // Ensure startDate and endDate are in yyyy-MM-dd format for input type="date"
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      // If already yyyy-MM-dd, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      // If contains T, split and take first part
      if (dateStr.includes('T')) return dateStr.split('T')[0];
      // Otherwise, try to parse and format
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    };
    this.modalTask = {
      taskDetails: task.taskDetails,
      startDate: formatDate(task.startDate),
      endDate: formatDate(task.endDate),
      estimatedHours: task.estimatedHours,
      completedInHours: task.completedInHours,
      status: task.status,
      comment: task.comment
    };
    this.isModalReadOnly = false;
    this.isEditMode = true;
    this.editingTaskId = task.taskId;
    this.showTaskModal = true;
  }

  editingTaskId: number | null = null;

  onUpdateTaskModal() {
    if (!this.modalTask.taskDetails || !this.modalTask.startDate || !this.modalTask.endDate || this.modalTask.estimatedHours === null) {
      this.showToastError('Please fill all required fields');
      return;
    }
    const payload = [
      {
        TaskId: this.editingTaskId,
        EmpId: this.empId,
        name: `${this.firstName} ${this.middleName || ''} ${this.lastName}`.trim(),
        TaskDetails: this.modalTask.taskDetails,
        StartDate: `${this.modalTask.startDate}T00:00:00`,
        EndDate: `${this.modalTask.endDate}T23:59:59`,
        EstimatedHours: this.modalTask.estimatedHours,
        CompletedInHours: this.modalTask.completedInHours || 0,
        Comment: this.modalTask.comment || '',
        Status: this.modalTask.status || 'Pending',
        ManagerRemark: '',
      }
    ];
    this.apiService.saveDailyTask(payload).subscribe({
      next: (response) => {
        // Update the task in myAllTasks and taskList
        const updatedTask = {
          taskId: this.editingTaskId ?? 0,
          taskDetails: this.modalTask.taskDetails,
          startDate: this.modalTask.startDate,
          endDate: this.modalTask.endDate,
          estimatedHours: this.modalTask.estimatedHours,
          completedInHours: this.modalTask.completedInHours || 0,
          status: this.modalTask.status || 'Pending',
          comment: this.modalTask.comment || '',
        };
        // Update in myAllTasks
        const idx = this.myAllTasks.findIndex(t => t.taskId === this.editingTaskId);
        if (idx !== -1) this.myAllTasks[idx] = { ...this.myAllTasks[idx], ...updatedTask };
        // Update in taskList
        const idx2 = this.taskList.findIndex(t => t.taskId === this.editingTaskId);
        if (idx2 !== -1) this.taskList[idx2] = { ...this.taskList[idx2], ...updatedTask };
        this.resetTaskModal();
        this.showTaskModal = false;
        this.isEditMode = false;
        this.editingTaskId = null;
        this.showToastSuccess('Task updated successfully!');
        this.getAllDailyTasksForAllEmployees(); // Refresh the task lists
      },
      error: (err) => {
        console.error('Error updating task:', err);
        this.showToastError('Failed to update task details');
      }
    });
  }



  showTaskModal = false;

  // Helper to get today's date in yyyy-MM-dd format
  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Open Task Request Form modal and set default dates
  openCreateTaskModal() {
    this.isEditMode = false;
    this.isModalReadOnly = false;
    this.editingTaskId = null;
    this.modalTask = {
      taskDetails: '',
      startDate: this.getToday(),
      endDate: this.getToday(),
      estimatedHours: null,
      completedInHours: null,
      status: '',
      comment: ''
    };
    this.showTaskModal = true;
  }

  getSelectedEmployeeName(): string {
    if (!this.selectedEmployeeId) return '';
    const user = this.nameList.find(u => u.empId === this.selectedEmployeeId);
    if (!user || !user.name) return '';
    // Split name by space and return only first and last name
    const nameParts = user.name.trim().split(' ');
    if (nameParts.length === 1) return nameParts[0];
    if (nameParts.length === 2) return nameParts.join(' ');
    // If more than two parts, return first and last
    return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
  }


  getAllDailyTasksForAllEmployees() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getAllDailyTasks().subscribe({
      next: (response: any[]) => {
        // The API returns an array
        console.log("tasks", response)
        const allTasks = Array.isArray(response) ? response : [];
        const myEmpId = sessionStorage.getItem('empId');
        // Filter for records where empId matches sessionStorage empId
        this.myAllTasks = allTasks.filter((task: any) => task.empId === myEmpId);
        this.myToDoTasks = this.myAllTasks
          .filter((task: any) => (task.status || '').toLowerCase() === 'to do')
          .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        this.myPendingTasks = this.myAllTasks
          .filter((task: any) => (task.status || '').toLowerCase() === 'in progress' || (task.status || '').toLowerCase() === 'pending')
          .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        this.myCompleteTasks = this.myAllTasks
          .filter((task: any) => (task.status || '').toLowerCase() === 'complete')
          .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        console.log('My Daily Tasks:', this.myAllTasks);
        console.log('To Do Tasks:', this.myToDoTasks);
        console.log('Pending Tasks:', this.myPendingTasks);
        console.log('Complete Tasks:', this.myCompleteTasks);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching all daily tasks:', err);
        this.errorMessage = 'Failed to load all daily tasks.';
        this.isLoading = false;
      }
    });
  }

  getSelectedEmployeeDailyTask() {
    this.isLoading = true;
    this.errorMessage = '';

    // Find the selected employee's name from nameList
    const selectedUser = this.nameList.find(user => user.empId === this.selectedEmployeeId);
    if (selectedUser) {
      console.log('Selected Employee Name:', selectedUser.name);
    } else {
      console.log('No employee selected or not found.');
    }

    // Fetch and filter tasks for the selected employee
    this.apiService.getAllDailyTasks().subscribe({
      next: (response: any[]) => {
        console.log("all tasks", response);
        const allTasks = Array.isArray(response) ? response : [];
        // Filter for records where empId matches selectedEmployeeId
        this.myAllTasks = allTasks.filter((task: any) => task.empId === this.selectedEmployeeId);
        this.myToDoTasks = this.myAllTasks
          .filter((task: any) => (task.status || '').toLowerCase() === 'to do')
          .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        this.myPendingTasks = this.myAllTasks
          .filter((task: any) => (task.status || '').toLowerCase() === 'in progress' || (task.status || '').toLowerCase() === 'pending')
          .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        this.myCompleteTasks = this.myAllTasks
          .filter((task: any) => (task.status || '').toLowerCase() === 'complete')
          .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        console.log('My Daily Tasks:', this.myAllTasks);
        console.log('To Do Tasks:', this.myToDoTasks);
        console.log('Pending Tasks:', this.myPendingTasks);
        console.log('Complete Tasks:', this.myCompleteTasks);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching all daily tasks:', err);
        this.errorMessage = 'Failed to load all daily tasks.';
        this.isLoading = false;
      }
    });
  }
  // Save modal task to database and update UI
  submitTaskModal() {
    if (!this.modalTask.taskDetails || !this.modalTask.startDate || !this.modalTask.endDate || this.modalTask.estimatedHours === null) {
      return;
    }
    // Use the selected status value from the modal
    const statusValue = this.modalTask.status || 'To Do';
    const payload = [
      {
        TaskId: 0,
        EmpId: this.empId,
        name: `${this.firstName} ${this.middleName || ''} ${this.lastName}`.trim(),
        TaskDetails: this.modalTask.taskDetails,
        StartDate: `${this.modalTask.startDate}T00:00:00`,
        EndDate: `${this.modalTask.endDate}T23:59:59`,
        EstimatedHours: this.modalTask.estimatedHours,
        CompletedInHours: this.modalTask.completedInHours || 0,
        Comment: this.modalTask.comment || '',
        Status: statusValue,
        ManagerRemark: '',
      }
    ];
    this.apiService.saveDailyTask(payload).subscribe({
      next: (response) => {
        const newTask = {
          taskId: response[0]?.TaskId || 0,
          taskDetails: this.modalTask.taskDetails,
          startDate: this.modalTask.startDate,
          endDate: this.modalTask.endDate,
          estimatedHours: this.modalTask.estimatedHours,
          completedInHours: this.modalTask.completedInHours || 0,
          status: statusValue,
          comment: this.modalTask.comment || '',
        };
        this.taskList.push(newTask);
        this.tasks.push(newTask);
        this.resetTaskModal();
        this.showTaskModal = false;
        this.showToastSuccess('Task details saved successfully!');
        this.getAllDailyTasksForAllEmployees(); // Refresh the task lists
      },
      error: (err) => {
        console.error('Error saving task:', err);
        this.showToastError('Failed to submit task details');
      }
    });
  }

  // Reset modal form fields
  resetTaskModal() {
    this.modalTask = {
      taskDetails: '',
      startDate: '',
      endDate: '',
      estimatedHours: null,
      completedInHours: null,
      status: '',
      comment: ''
    };
    this.isModalReadOnly = false;
    this.isEditMode = false;
    this.editingTaskId = null;
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

    console.log('employeesUnderManager:', this.employeesUnderManager);
  }


  onEmployeeSelect() {
    if (this.selectedEmployeeId) {
      this.getSelectedEmployeeDailyTask();
      this.showTaskList = true;
    }
  }


  cancelPendingForm() {
    this.showPendingTaskForm = false;
  }

  toggleCalendarView() {
    this.showCalendar = !this.showCalendar;
    if (this.showCalendar) {
      const empIdToFetch = this.isManager ? this.selectedEmployeeId : this.empId;
      this.fetchAllDailyTasksCal(empIdToFetch);
    }
  }

  fetchAllDailyTasksCal(empId?: string) {
    const targetEmpId = empId || this.empId;
    this.apiService.getDailyTaskByEmpId(targetEmpId).subscribe((data: any[]) => {
      const taskEvents = data.map(task => ({
        id: task.taskId.toString(),
        title: `${task.taskDetails} (${task.status || 'Pending'})`,
        start: task.startDate,
        end: new Date(new Date(task.endDate).getTime() + 86400000).toISOString(),
        extendedProps: {
          estimatedHours: task.estimatedHours || 0,
          completedInHours: task.completedInHours || 0,
          comment: task.comment || '',
          status: task.status || 'Pending'
        }
      }));

      this.calendarOptions = {
        ...this.calendarOptions,
        events: taskEvents,
        eventDidMount: (info) => {
          const props = info.event.extendedProps;
          const tooltip = `Task: ${info.event.title}`;
          info.el.setAttribute('title', tooltip);
        }
      };
    }, error => {
      console.error('Error loading calendar tasks:', error);
    });
  }




  taskData = {
    date: '',
    taskDetails: '',
    estimatedHours: 0,
    completedInHours: 0,
    comment: ''
  }

  pendingTask = {
    date: '',
    taskDetails: '',
    estimatedHours: 0,
    completedInHours: 0,
    comment: ''
  };

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    weekends: true,
    events: [],
    hiddenDays: [0]
  };

  generateYearDates() {
    const currentYear = new Date().getFullYear();
    const dates = [];
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    this.currentYearDates = dates;
  }

  loadHolidays() {
    this.apiService.getAllHolidays().subscribe({
      next: (holidays: Holiday[]) => {
        this.holidays = holidays;
        this.calculatePendingDates();
      },
      error: (err) => console.error('Error loading holidays:', err)
    });
  }

  private calculatePendingDates() {
    // Get all unique start dates from existing tasks
    const existingStartDates = new Set(
      [...this.tasks, ...this.taskList]
        .filter(task => task.startDate)
        .map(task => task.startDate.split('T')[0])
    );

    // Get all holiday dates
    const holidayDates = new Set(
      this.holidays.map(holiday => holiday.date.split('T')[0])
    );

    // Get leave requests for this employee
    this.apiService.getLeaveRequestByEmpId(this.empId).subscribe({
      next: (leaveRequests: LeaveRequest[]) => {
        // Filter approved leave requests
        const approvedLeaves = leaveRequests.filter(leave =>
          leave.status === 'Approved'
        );

        // Get all dates covered by approved leaves
        const leaveDates = new Set<string>();
        approvedLeaves.forEach(leave => {
          const startDate = new Date(leave.startDate);
          const endDate = new Date(leave.endDate);

          // Add all dates in the leave range (including start and end dates)
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            leaveDates.add(d.toISOString().split('T')[0]);
          }
        });

        // Now filter the pending dates
        this.pendingDates = this.currentYearDates.filter(date => {
          const dayOfWeek = new Date(date).getDay();
          return !existingStartDates.has(date) &&
            !holidayDates.has(date) &&
            !leaveDates.has(date) &&
            dayOfWeek !== 0 && // Exclude Sundays
            date <= new Date().toISOString().split('T')[0]; // Only dates up to today
        });

        this.filteredPendingDates = [...this.pendingDates];
      },
      error: (err) => {
        console.error('Error fetching leave requests:', err);
        // Fallback to calculation without leave dates if there's an error
        this.pendingDates = this.currentYearDates.filter(date => {
          const dayOfWeek = new Date(date).getDay();
          return !existingStartDates.has(date) &&
            !holidayDates.has(date) &&
            dayOfWeek !== 0 && // Exclude Sundays
            date <= new Date().toISOString().split('T')[0]; // Only dates up to today
        });
        this.filteredPendingDates = [...this.pendingDates];
      }
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

  showPendingTasks() {
    this.calculatePendingDates();
    this.showCard = true;
  }

  submitPendingTask() {
    if (!this.taskData.date || !this.taskData.taskDetails ||
      this.taskData.estimatedHours === null || this.taskData.completedInHours === null) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = [
      {
        TaskId: 0,
        EmpId: this.empId,
        name: `${this.userData.firstName} ${this.userData.middleName || ''} ${this.userData.lastName}`.trim(),
        TaskDetails: this.taskData.taskDetails,
        StartDate: `${this.taskData.date}T00:00:00`,
        EndDate: `${this.taskData.date}T23:59:59`,
        EstimatedHours: this.taskData.estimatedHours,
        CompletedInHours: this.taskData.completedInHours || 0,
        Comment: this.taskData.comment || '',
        Status: 'Pending',
        ManagerRemark: '',
      }
    ];

    this.apiService.saveDailyTask(payload).subscribe({
      next: (response) => {
        const newTask: Task = {
          taskId: response[0]?.TaskId || 0,
          taskDetails: this.taskData.taskDetails,
          startDate: this.taskData.date,
          endDate: this.taskData.date,
          estimatedHours: this.taskData.estimatedHours,
          completedInHours: this.taskData.completedInHours || 0,
          status: 'Pending',
          comment: this.taskData.comment || '',
        };

        this.taskList.push(newTask);
        this.tasks.push(newTask);

        this.resetTaskForm();
        this.showPendingTaskForm = false;
        this.showTaskList = true;
        this.calculatePendingDates();
        this.isLoading = false;
        this.showToastSuccess('Task details saved successfully!');
      },
      error: (err) => {
        console.error('Error saving task:', err);
        this.errorMessage = err.error?.message || 'Failed to submit task';
        this.isLoading = false;
        this.showToastError('Failed to submit task details');
      }
    });
  }

  /**
   * Fetches all users and returns a list of objects with empId and full name.
   * @returns Promise<{ empId: string, name: string }[]>
   */
  getAllUserName(): Promise<{ empId: string, name: string }[]> {
    return new Promise((resolve, reject) => {
      this.apiService.getAllUsers().subscribe({
        next: (users: any[]) => {
          const nameList = users.map(user => ({
            empId: user.empId,
            name: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ')
          }));
          resolve(nameList);
        },
        error: (err) => {
          console.error('Error fetching all users:', err);
          reject(err);
        }
      });
    });
  }

  private resetTaskForm() {
    this.pendingTask = {
      date: '',
      taskDetails: '',
      estimatedHours: 0,
      completedInHours: 0,
      comment: ''
    };
  }


  fetchAllDailyTasks(empId?: string) {
    const targetEmpId = empId || this.empId;
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getDailyTaskByEmpId(targetEmpId).subscribe({
      next: (response) => {
        const formattedTasks = response.map((task: any) => ({
          taskId: task.taskId,
          taskDetails: task.taskDetails,
          startDate: task.startDate ? task.startDate.split('T')[0] : '',
          endDate: task.endDate ? task.endDate.split('T')[0] : '',
          estimatedHours: task.estimatedHours || 0,
          completedInHours: task.completedInHours || 0,
          status: task.status || 'Pending',
          comment: task.comment || ''
        }));
        console.log("formattedTasks: ", formattedTasks);



        // Populate todoTasks for TO DO box (show only Pending tasks)
        this.todoTasks = formattedTasks
          .filter((task: any) => task.status === 'Pending')
          .map((task: any) => ({
            taskDetails: task.taskDetails,
            startDate: task.startDate,
            estimatedHours: task.estimatedHours
          }));

        this.calculatePendingDates();
        this.taskList = formattedTasks; // ✅ Sets the readonly table data
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching tasks:', err);
        this.errorMessage = 'Failed to load tasks.';
        this.isLoading = false;
      }
    });
  }


  toggleView() {
    this.showTaskList = !this.showTaskList;
    if (this.showTaskList) {
      this.showCalendar = false;
      this.loadTaskList();
    }
  }

  loadTaskList() {
    if (!this.empId) {
      console.error('Employee ID is not available');
      return;
    }

    this.apiService.getDailyTaskByEmpId(this.empId).subscribe({
      next: (tasks) => {
        const apiTasks = tasks.map((task: { startDate: string; endDate: string; }) => ({
          ...task,
          startDate: task.startDate ? task.startDate.split('T')[0] : '',
          endDate: task.endDate ? task.endDate.split('T')[0] : ''
        }));

        this.taskList = [...apiTasks, ...this.taskList.filter(t => !t.taskId)];
      },
      error: (err) => {
        console.error('Error fetching task list:', err);
      }
    });
  }

  loadPendingTasksForm(date: string) {
    this.showPendingTaskForm = true;
    this.taskData = {
      date: date,
      taskDetails: '',
      estimatedHours: 0,
      completedInHours: 0,
      comment: ''
    };
    this.pendingTask = {
      date: date,
      taskDetails: '',
      estimatedHours: 0,
      completedInHours: 0,
      comment: ''
    };
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

  selectRow(index: number): void {
    this.selectedIndex = index;
  }

  addRow(): void {
    const today = new Date().toISOString().split('T')[0];
    this.tasks.push({
      taskDetails: '',
      startDate: today,
      endDate: today,
      estimatedHours: null,
      completedInHours: null,
      status: 'Pending',
      comment: '',
      isEditing: true
    });
  }

  editRow(): void {
    if (this.selectedIndex === null) {
      alert('Please select a row first');
      return;
    }
  }

  saveRow(): void {
    for (const task of this.tasks) {
      if (!this.validateTask(task)) {
        return;
      }
    }

    const payload = this.tasks.map(task => ({
      TaskId: task.taskId || 0,
      EmpId: this.empId,
      name: `${this.userData.firstName} ${this.userData.middleName || ''} ${this.userData.lastName}`.trim(),
      TaskDetails: task.taskDetails,
      StartDate: task.startDate ? `${task.startDate}T00:00:00` : null,
      EndDate: task.endDate ? `${task.endDate}T00:00:00` : null,
      EstimatedHours: task.estimatedHours,
      CompletedInHours: task.completedInHours,
      Comment: task.comment,
      Status: task.status
    }));

    this.apiService.saveDailyTask(payload).subscribe({
      next: (response) => {
        this.showToastSuccess('Task details saved successfully!');
        this.calculatePendingDates();
        this.resetAll();
      },
      error: (error) => {
        console.error('Error saving tasks:', error);
        this.showToastError('Failed to submit task details');
      }
    });
  }

  private validateTask(task: Task): boolean {
    if (!task.taskDetails) {
      alert('Please enter task details for all rows');
      return false;
    }

    if (!task.startDate) {
      alert('Please select a start date for all rows');
      return false;
    }

    if (!task.endDate) {
      alert('Please select an end date for all rows');
      return false;
    }

    if (task.estimatedHours === null || task.estimatedHours <= 0) {
      alert('Please enter valid estimated hours for all rows');
      return false;
    }

    // if (task.completedInHours === null || task.completedInHours < 0) {
    //   alert('Please enter valid completed hours for all rows');
    //   return false;
    // }


    return true;
  }

  showToastSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

  showToastError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  deleteRow(): void {
    if (this.selectedIndex === null || this.selectedIndex < 0) {
      alert('Please select a row first');
      return;
    }

    const selectedTask = this.tasks[this.selectedIndex];

    if (selectedTask.taskId) {
      this.apiService.deleteDailyTask(selectedTask.taskId).subscribe({
        next: () => {
          this.tasks.splice(this.selectedIndex!, 1);
          this.selectedIndex = null;
          alert('Task deleted successfully');
          this.calculatePendingDates();
        },
        error: (error) => {
          console.error('Delete failed:', error);
          alert('Failed to delete task. Please try again.');
        }
      });
    } else {
      this.tasks.splice(this.selectedIndex, 1);
      this.selectedIndex = null;
    }
  }

  resetAll(): void {
    const today = new Date().toISOString().split('T')[0];
    this.tasks = [{
      taskDetails: '',
      startDate: today,
      endDate: today,
      estimatedHours: null,
      completedInHours: null,
      status: 'Pending',
      comment: '',
      isEditing: true
    }];
    this.selectedIndex = null;
  }


  // Add these properties to your component class
  showUploadExcelModal: boolean = false;
  fileValidationMessage: string = '';
  uploadProgress: number = -1;
  isUploading: boolean = false;
  selectedDailyTaskFile: File | null = null;

  // Replace the existing upload modal methods with these:

  // Open modal
  openUploadExcelModal() {
    this.showUploadExcelModal = true;
  }

  // Close modal and reset
  closeUploadExcelModal() {
    this.showUploadExcelModal = false;
    this.fileValidationMessage = '';
    this.uploadProgress = -1;
    this.isUploading = false;
    this.selectedDailyTaskFile = null;
  }

  // File selection with drag and drop support
  onDailyTaskFileSelected(event: any) {
    const file = event.target.files[0];
    this.validateAndSetFile(file);
  }

  // Drag and drop handler
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndSetFile(files[0]);
    }
  }

  // File validation
  validateAndSetFile(file: File) {
    if (file) {
      // Validate file type
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

      if (!validExtensions.includes(fileExtension)) {
        this.fileValidationMessage = 'Only Excel files (.xlsx, .xls) are allowed.';
        this.selectedDailyTaskFile = null;
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.fileValidationMessage = 'File size must be less than 5 MB.';
        this.selectedDailyTaskFile = null;
        return;
      }

      this.selectedDailyTaskFile = file;
      this.fileValidationMessage = '';
    }
  }

  // Upload file
  uploadDailyTaskExcel() {
    if (!this.selectedDailyTaskFile) {
      this.showToastError('Please select an Excel file first.');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    this.apiService.uploadDailyTaskExcel(this.selectedDailyTaskFile).subscribe({ 
      next: (event: any) => {
        console.log("anxjsn",this.selectedDailyTaskFile);
        if (event.type === HttpEventType.UploadProgress) {
          // Update progress %
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          this.showToastSuccess('Excel uploaded successfully!');
          this.closeUploadExcelModal();
          this.getAllDailyTasksForAllEmployees(); // Refresh tasks after upload
        }
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.showToastError('Failed to upload Excel file.');
        this.isUploading = false;
        this.uploadProgress = -1;
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }

  // Add drag over prevention
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  // Add drag leave prevention  
  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  //filter code 
  filterStartDate: string = '';
  filterEndDate: string = '';
  originalMyAllTasks: any[] = [];
  originalMyToDoTasks: any[] = [];
  originalMyPendingTasks: any[] = [];
  originalMyCompleteTasks: any[] = [];
  isFilterApplied: boolean = false;
  // Update the applyDateFilter method
  applyDateFilter() {
    if (!this.filterStartDate || !this.filterEndDate) {
      this.showToastError('Please select both Start Date and End Date');
      return;
    }

    if (this.filterStartDate > this.filterEndDate) {
      this.showToastError('Start Date cannot be after End Date');
      return;
    }

    const filteredTasks = this.myAllTasks.filter(task => {
      if (!task.startDate) return false;

      // Extract date part in YYYY-MM-DD format
      let taskDate = task.startDate;
      if (task.startDate.includes('T')) {
        taskDate = task.startDate.split('T')[0];
      }

      return taskDate >= this.filterStartDate && taskDate <= this.filterEndDate;
    });

    // Update task categories (same as before)
    this.myToDoTasks = filteredTasks
      .filter((task: any) => (task.status || '').toLowerCase() === 'to do')
      .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    this.myPendingTasks = filteredTasks
      .filter((task: any) => (task.status || '').toLowerCase() === 'in progress' || (task.status || '').toLowerCase() === 'pending')
      .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    this.myCompleteTasks = filteredTasks
      .filter((task: any) => (task.status || '').toLowerCase() === 'complete')
      .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    this.taskList = filteredTasks;

    this.showToastSuccess(`Filter applied: ${filteredTasks.length} tasks found`);
  }
  // Add helper method to update task categories
  private updateTaskCategories(tasks: any[]) {
    this.myAllTasks = tasks;

    this.myToDoTasks = tasks
      .filter((task: any) => (task.status || '').toLowerCase() === 'to do')
      .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    this.myPendingTasks = tasks
      .filter((task: any) => (task.status || '').toLowerCase() === 'in progress' || (task.status || '').toLowerCase() === 'pending')
      .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    this.myCompleteTasks = tasks
      .filter((task: any) => (task.status || '').toLowerCase() === 'complete')
      .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  // Update clearDateFilter method
  clearDateFilter() {
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.isFilterApplied = false;
    this.updateTaskCategories(this.originalMyAllTasks);
    this.showToastSuccess('Filter cleared');
  }
}