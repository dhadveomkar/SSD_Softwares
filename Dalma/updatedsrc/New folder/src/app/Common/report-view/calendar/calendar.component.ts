import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';

// Import FullCalendar plugins (used inside class, NOT in imports array)
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {
calendarOptions: CalendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  events: [
    {
      title: 'WFH - Arati Pawar',
      date: '2025-07-15',
      color: '#17a2b8',
      extendedProps: {
        type: 'Work From Home',
        status: 'Approved',
        description: 'Internet issue'
      }
    },
     {
      title: 'office - Arati Pawar',
      date: '2025-07-01',
      color: '#17a2b8',
      extendedProps: {
        type: 'Work From Home',
        status: 'Approved',
        description: 'Internet issue'
      }
    },
    {
      title: 'Sick Leave - Raj',
      date: '2025-07-16',
      color: '#dc3545',
      extendedProps: {
        type: 'Sick Leave',
        status: 'Pending',
        description: 'Fever'
      }
    },
    
  ],
  
  eventClick: (info) => {
    this.selectedEvent = info.event;
    this.showEventModal = true;
  },
  eventDidMount: function (info) {
    const tooltip = `
      ${info.event.title}
      Type: ${info.event.extendedProps['type']}
      Status: ${info.event.extendedProps['status']}
    `;
    info.el.setAttribute('title', tooltip);
  }
};
  selectedEvent: any;
  showEventModal = false;

  closeModal() {
    this.showEventModal = false;
    this.selectedEvent = null;
  }
selectedCalendar: 'leave' | 'attendance' = 'leave';



}
