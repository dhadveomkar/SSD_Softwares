import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import * as XLSX from 'xlsx';
import { ApiService } from '../../../services/services';

@Component({
  selector: 'app-holiday-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule, ToastModule, DropdownModule],
  templateUrl: './holiday-calendar.component.html',
  styleUrl: './holiday-calendar.component.css',
  providers: [MessageService]
})
export class HolidayCalendarComponent {
  showModal = false;
  showCalendar = false;
 selectedHolidaySet: string | null = null;
  holidaySets: string[] = [];
  holidaySetOptions: any[] = [];
  filteredOfficialHolidays: any[] = [];
  filteredOptionalHolidays: any[] = [];
  calendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    events: [] as EventInput[],
     height: 700,
    // ...other options as needed
  };
  constructor(private apiService: ApiService, private messageService: MessageService) { }

  // Returns a 2D array representing the weeks of the month for the calendar view
  getCalendarWeeks(year: number, month: number): number[][] {
    // month: 1-based (Jan=1)
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const weeks: number[][] = [];
    let week: number[] = [];
    // JS: 0=Sun, 1=Mon, ..., 6=Sat. We want Mon=0, Sun=6
    let startDay = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < startDay; i++) week.push(0);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      week.push(d);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(0);
      weeks.push(week);
    }
    return weeks;
  }

  // Returns holidays (official/optional) for a given day
  getHolidaysForDay(day: number, month: number, year: number): any[] {
    if (day === 0) return [];
    const dateStr = this.formatDate(year, month, day);
    return [
      ...this.filteredOfficialHolidays.filter(h => this.isSameDate(h.date, dateStr)),
      ...this.filteredOptionalHolidays.filter(h => this.isSameDate(h.date, dateStr))
    ];
  }

  // Format date as yyyy-MM-dd
  formatDate(year: number, month: number, day: number): string {
    return `${year}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}`;
  }

  // Check if two dates (yyyy-MM-dd) are the same
  isSameDate(date1: string, date2: string): boolean {
    if (typeof date1 === 'string' && typeof date2 === 'string') {
      return date1.slice(0, 10) === date2.slice(0, 10);
    }
    return false;
  }

  // Highlight today
  isToday(day: number, month: number, year: number): boolean {
    if (day === 0) return false;
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() + 1 === month &&
      today.getDate() === day
    );
  }
  // Handle file selection for holiday sheet upload
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonData || jsonData.length < 2) {
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'File Error',
            detail: 'Excel file is empty or missing data.',
            life: 3000
          });
          return;
        }

        const [header, ...rows] = jsonData;
        const requiredColumns = ['Date', 'Name', 'Description', 'Type'];0
        const headerMap = header.map((h: any) => (h || '').toString().trim().toLowerCase());
        const missing = requiredColumns.filter(col => !headerMap.includes(col.toLowerCase()));

        if (missing.length > 0) {
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'Missing Columns',
            detail: 'Missing required columns: ' + missing.join(', '),
            life: 3000
          });
          return;
        }
 

        // Map column indexes
        const colIndexes = requiredColumns.map(col => headerMap.indexOf(col.toLowerCase()));

        // Map rows to objects
        const holidaysToSave = rows
          .filter(row => row && row.length >= 5)
          .map(row => ({
            date: row[colIndexes[0]],
            name: row[colIndexes[1]],
            description: row[colIndexes[2]],
            type: row[colIndexes[3]],
            holidaySet: row[colIndexes[4]]
          }));

        if (holidaysToSave.length === 0) {
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'File Error',
            detail: 'No valid holiday data found in the file.',
            life: 3000
          });
          return;
        }

        // Populate unique holiday sets for dropdown
        this.holidaySets = Array.from(new Set(holidaysToSave.map(h => h.holidaySet)));

        // Directly save all holidays from the file, allowing duplicates
        let savedCount = 0;
        holidaysToSave.forEach(holiday => {
          this.apiService.saveHoliday(holiday).subscribe({
            next: () => {
              savedCount++;
              if (savedCount === holidaysToSave.length) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'All holidays uploaded successfully.',
                  life: 2500
                });
                this.fetchHolidaysCal();
              }
            },
            error: (err: any) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `Failed to save holiday: ${holiday.name || ''}`,
                life: 3000
              });
            }
          });
        });
      };

      reader.readAsArrayBuffer(file);
    }
  }


  // Download all holidays as Excel file
  downloadExcel(): void {
    const wsData = [
      ['Date', 'Name', 'Description', 'Type'],
      ...((this.holidays || []).map((h: any) => [h.date, h.name, h.description, h.type]))
    ];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Holidays');
    XLSX.writeFile(wb, 'Holiday.xlsx');
  }
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();
  hasAddHolidayPermission: boolean = false;
  holidays: any[] = [];
  officialHolidays: any[] = [];
  optionalHolidays: any[] = [];
  monthCalendars: CalendarOptions[] = [];
  monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Form State
  newHoliday = {
    date: '',
    name: '',
    description: ''
  };

  // Returns true if the holiday is in the current month and date >= today
  public isUpcomingThisMonth(dateStr: string): boolean {
    if (!dateStr) return false;
    const holidayDate = new Date(dateStr);
    const today = new Date();
    return (
      holidayDate.getFullYear() === today.getFullYear() &&
      holidayDate.getMonth() === today.getMonth() &&
      holidayDate.getDate() >= today.getDate()
    );
  }

  ngOnInit() {
    this.fetchHolidaysCalWithDefaultSet();
    this.checkUserRole();
  }
  // added deviyani patil 
  //invailda text remove  clikc on out side
checkValidSelection(dropdownRef: any) {
  setTimeout(() => {
    const typedValue = dropdownRef?.filterValue?.trim()?.toLowerCase();
    const match = this.holidaySetOptions.find((opt: any) =>
      opt.label.toLowerCase() === typedValue
    );

    if (!match) {
      this.selectedHolidaySet = null;
      dropdownRef.filterValue = '';
    }
  },0);
}


  // Fetch holidays and set default holiday set from sessionStorage or user
  fetchHolidaysCalWithDefaultSet() {
    this.apiService.getAllHolidays().subscribe((data: any[]) => {
      const sorted = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      this.holidays = sorted.map(item => ({
        date: item.date,
        name: item.name,
        description: item.description,
        type: item.type || 'Optional leave',
        holidaySet: item.holidaySet || ''
      }));

      this.officialHolidays = this.holidays.filter(h => h.type.toLowerCase() === 'official leave' || h.type.toLowerCase() === 'official');
      this.optionalHolidays = this.holidays.filter(h => h.type.toLowerCase() === 'optional leave' || h.type.toLowerCase() === 'optional');

      this.holidaySets = [...new Set(this.holidays.map(h => h.holidaySet).filter(s => !!s))];
      
      // Get the holiday value from sessionStorage
      const sessionHolidayValue = sessionStorage.getItem('holiday');
      
      // Filter holiday sets that start with the same prefix (before hyphen)
      let filteredSets = this.holidaySets;
      if (sessionHolidayValue && sessionHolidayValue.trim() !== '') {
        const prefix = sessionHolidayValue.split('-')[0].toLowerCase().trim();
        filteredSets = this.holidaySets.filter(set => set.split('-')[0].toLowerCase() === prefix);
      }
      
      this.holidaySetOptions = filteredSets.map(set => ({ label: set, value: set }));

      // Set default selectedHolidaySet from sessionStorage or fallback
      if (sessionHolidayValue && filteredSets.includes(sessionHolidayValue)) {
        this.selectedHolidaySet = sessionHolidayValue;
      } else {
        // Fallback: try to use the user's assigned set if available
        const userSet = sessionStorage.getItem('holidaySet');
        if (userSet && filteredSets.includes(userSet)) {
          this.selectedHolidaySet = userSet;
        } else {
          this.selectedHolidaySet = '';
        }
      }

      this.filterHolidaysBySet();
      this.updateCalendarEvents();
    });
  }

  // Update FullCalendar events to only show holidays from the selected set
  updateCalendarEvents() {
    let filteredOfficial = this.officialHolidays;
    let filteredOptional = this.optionalHolidays;
    if (this.selectedHolidaySet && this.selectedHolidaySet.trim() !== '') {
      const selectedSet = this.selectedHolidaySet.trim().toLowerCase();
      filteredOfficial = this.officialHolidays.filter(
        h => (h.holidaySet || '').trim().toLowerCase() === selectedSet
      );
      filteredOptional = this.optionalHolidays.filter(
        h => (h.holidaySet || '').trim().toLowerCase() === selectedSet
      );
    }
    const events = [
      ...filteredOfficial.map(h => ({
        title: h.name,
        date: h.date,
        className: 'official',
        description: h.description,
        allDay: true
      })),
      ...filteredOptional.map(h => ({
        title: h.name,
        date: h.date,
        className: 'optional',
        description: h.description,
        allDay: true
      }))
    ];
    this.calendarOptions = {
      ...this.calendarOptions,
      events
    };
  }

  checkUserRole() {
    // Get the roleId from sessionStorage
    const roleId = sessionStorage.getItem('roleId');

    // Check if roleId is 1 (Admin)
    const userRole = roleId === '1' ? 'admin' : null;

    // Set permission based on admin role
    this.hasAddHolidayPermission = userRole
      ? ['admin'].includes(userRole.toLowerCase())
      : false;
  }



  // fetchHolidaysCal() {
  //   this.apiService.getAllHolidays().subscribe((data: any[]) => {
  //     // Sort holidays by date ascending
  //     const sorted = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  //     // Map to only needed fields: Date, Name, Description, Type
  //     this.holidays = sorted.map(item => ({
  //       date: item.date,
  //       name: item.name,
  //       description: item.description,
  //       type: item.type || 'Optional leave'
  //     }));
  //     this.officialHolidays = this.holidays.filter(h => h.type.toLowerCase() === 'official leave' || h.type.toLowerCase() === 'official');
  //     this.optionalHolidays = this.holidays.filter(h => h.type.toLowerCase() === 'optional leave' || h.type.toLowerCase() === 'optional');
  //     console.log('Official:', this.officialHolidays);
  //     console.log('Optional:', this.optionalHolidays);
  //   });
  // }

  fetchHolidaysCal() {
    this.apiService.getAllHolidays().subscribe((data: any[]) => {
      const sorted = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      this.holidays = sorted.map(item => ({
        date: item.date,
        name: item.name,
        description: item.description,
        type: item.type || 'Optional leave',
        holidaySet: item.holidaySet || ''
      }));

      this.officialHolidays = this.holidays.filter(h => h.type.toLowerCase() === 'official leave' || h.type.toLowerCase() === 'official');
      this.optionalHolidays = this.holidays.filter(h => h.type.toLowerCase() === 'optional leave' || h.type.toLowerCase() === 'optional');

      this.holidaySets = [...new Set(this.holidays.map(h => h.holidaySet).filter(s => !!s))];

      this.holidaySetOptions = this.holidaySets.map(set => ({
        label: set,
        value: set
      }));

      this.filteredOfficialHolidays = this.officialHolidays;
      this.filteredOptionalHolidays = this.optionalHolidays;

      // Populate FullCalendar events with holidays
      const events = [
        ...this.officialHolidays.map(h => ({
          title: h.name,
          date: h.date,
          className: 'official',
          description: h.description,
          allDay: true
        })),
        ...this.optionalHolidays.map(h => ({
          title: h.name,
          date: h.date,
          className: 'optional',
          description: h.description,
          allDay: true
        }))
      ];
      this.calendarOptions = {
        ...this.calendarOptions,
        events
      };
    });
  }

  // Open the modal
  openAddHolidayForm() {
    this.showModal = true;
  }

  // Submit new holiday
  submitHoliday() {
    this.apiService.saveHoliday(this.newHoliday).subscribe({
      next: () => {
        this.fetchHolidaysCal(); // Refresh calendar
        this.showModal = false;
        this.newHoliday = { date: '', name: '', description: '' }; // Reset form
      },
      error: (err: any) => console.error('Failed to add holiday:', err)
    });
  }

  filterHolidaysBySet() {
    if (!this.selectedHolidaySet || this.selectedHolidaySet.trim() === '') {
      this.filteredOfficialHolidays = this.officialHolidays;
      this.filteredOptionalHolidays = this.optionalHolidays;
    } else {
      const selectedSet = this.selectedHolidaySet.trim().toLowerCase();
      this.filteredOfficialHolidays = this.officialHolidays.filter(
        h => (h.holidaySet || '').trim().toLowerCase() === selectedSet
      );
      this.filteredOptionalHolidays = this.optionalHolidays.filter(
        h => (h.holidaySet || '').trim().toLowerCase() === selectedSet
      );
    }
    this.updateCalendarEvents();
  }


}
