import { Routes } from '@angular/router';
import { HolidayCalendarComponent } from './Common/holiday-calendar/holiday-calendar.component';
import { HomePageComponent } from './Common/home-page/home-page.component';
import { LoginComponent } from './Common/login/login.component';
import { ProfilePageComponent } from './Common/profile-page/profile-page.component';
import { CalendarComponent } from './Common/report-view/calendar/calendar.component';
import { CreateHolidayComponent } from './Manager-pages/create-holiday/create-holiday.component';
import { EmployeeListComponent } from './Manager-pages/employee-list/employee-list.component';
import { LeaveApprovePageComponent } from './Manager-pages/leave-approve-page/leave-approve-page.component';
import { ManagerAttendancePageComponent } from './Manager-pages/manager-attandance-page/manager-attandance-page.component';
import { AttandancePageComponent } from './Pages/attendance-page/attandance-page.component';
import { CreatePageComponent } from './Pages/create-page/create-page.component';
import { LeavePageComponent } from './Pages/leave-page/leave-page.component';
import { TaskPageComponent } from './Pages/task-page/task-page.component';
import { WeeklyTimesheetComponent } from './Pages/weekly-timesheet/weekly-timesheet.component';
 
 
export const routes: Routes = [
    { path: "", redirectTo: "login-page", pathMatch: "full" },
    { path: 'home-page', component: HomePageComponent },
    { path: "login-page", component: LoginComponent },
    {path:"profile-page", component: ProfilePageComponent},
    // { path:"dashboard-page", component: ChildHeaderComponent },
    { path: "report-page", component: CalendarComponent },
    { path: "create-page", component: CreatePageComponent },
    { path: 'employee-list', component: EmployeeListComponent },
    { path: 'leave-page', component: LeavePageComponent },
    { path: 'attandance-page', component: AttandancePageComponent },
    { path: 'holiday-calendar', component: HolidayCalendarComponent },
    { path: 'create-holiday', component: CreateHolidayComponent },
 
    { path: 'leave-approve-page', component: LeaveApprovePageComponent },
    { path: 'manager-attandance-page', component: ManagerAttendancePageComponent },
    
    { path: 'task-page', component: TaskPageComponent },

    { path: 'weekly-timesheet', component: WeeklyTimesheetComponent },
];
 
 