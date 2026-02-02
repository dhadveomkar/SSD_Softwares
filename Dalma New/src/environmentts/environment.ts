
export const environment = {
    //baseurl : "http://60.254.115.242:8082/api",
    baseurl: "http://localhost:5050/api",

    // Profile-OfficeAddress
    GetOfficeAddressById: "/OfficeAddress/GetOfficeAddress/{id}",

    // Forgot Password
    GetForgotPassword : "/Users/ForgotPassword",
    VerifyOtp: "/Users/VerifyOtp",
    ResetPassword: "/Users/ResetPassword",
    VerifyOldPassword: "/Users/VerifyOldPassword",
    ChangePassword: "/Users/ChangePassword",

    //Timesheet
    SaveWeeklyTimesheet : "/Timesheet/SaveWeeklyTimesheet",
    GetWeeklyTimesheet : "/Timesheet/getWeeklyTimesheets",
    SaveTimesheetLeave : "/Timesheet/SaveTimesheetLeave",
    GetAllTimesheetLeave : "/Timesheet/GetAllTimesheetLeave",


    // Users
   GetLogin: "/Users/Login",
    GetAllUsers: "/Users/GetAllUsers",
    GetUserById: "/Users/GetUser/{id}",
    SaveUser: "/Users/Save",
    DeleteUser: "/Users/Delete/{id}",
    GetUsersByComapanyId: "/Users/GetUsersByCompany/{companyId}",
    GetCompanyById: "/Users/GetCompany/{companyId}",
   GetDepartmentName: "/Users/GetDepartmentName/{departmentId}",
   GetDesignationName: "/Users/GetDesignationName/{designationId}",
   GetRoleName: "/Users/GetRoleName/{roleId}",
   GetAllDepartments: "/Users/GetAllDepartments",
   GetAllDesignations: "/Users/GetAllDesignations",
   GetAllRoles: "/Users/GetAllRoles",


    // Attendance
    GetAllAttendances: "/Attendance/GetAllAttendances",
    GetAttendanceById: "/Attendance/GetAttendance/{id}",
    GetAttendanceByEmpId: "/Attendance/GetAttendanceByEmpId/{id}",
    SaveAttendance: "/Attendance/Save",
    DeleteAttendance: "/Attendance/Delete/{id}",

    // AttendanceRegularization
    GetAllAttendanceRegularizations: "/GetAllAttendanceRegularizations",
    GetAttendanceRegularizationById: "/GetAttendanceRegularization/{id}",
    SaveAttendanceRegularization: "/AttendanceRegularization/Save",
    DeleteAttendanceRegularization: "/AttendanceRegularization/Delete/{id}",

    // Holiday
    GetAllHolidays: "/Holidays/GetAllHolidays",
    GetHolidayById: "/Holidays/GetHoliday/{id}",
    SaveHoliday: "/Holidays/Save",
    DeleteHoliday: "/Holiday/Delete/{id}",

    //LeaveCount
    GetAllLeaveCounts: "/LeaveCount/GetAllLeaveCount",

    // LeaveRequest
    GetAllLeaveRequests: "/LeaveRequest/GetAllLeaveRequests",
    GetLeaveRequestById: "/LeaveRequest/GetLeaveRequest/{id}",
    GetLeaveRequestByEmpId: "/LeaveRequest/GetLeaveRequestByEmpId/{id}",
    SaveLeaveRequest: "/LeaveRequest/Save",
    DeleteLeaveRequest: "/LeaveRequest/Delete/{id}",

    // LeaveBalance
    GetAllLeaveBalances: "/LeaveBalance/GetAllLeaveBalances",
    GetLeaveBalanceById: "/LeaveBalance/GetLeaveBalance/{id}",
    SaveLeaveBalance: "/LeaveBalance/Save",
    DeleteLeaveBalance: "/LeaveBalance/Delete/{id}",

    // LeaveType
    GetAllLeaveTypes: "/LeaveType/GetAllLeaveTypes",
    GetLeaveTypeById: "/LeaveType/GetLeaveType/{id}",
    SaveLeaveType: "/LeaveType/Save",
    DeleteLeaveType: "/LeaveType/Delete/{id}",

    // Project
    GetAllProjects: "/Project/GetAllProjects",
    GetProjectById: "/Project/GetProject/{id}",
    SaveProject: "/Project/Save",
    DeleteProject: "/Project/Delete/{id}",

    // DailyTask
    GetAllDailyTasks: "/DailyTask/GetAllDailyTasks",
    GetDailyTaskById: "/DailyTask/GetDailyTask/{id}",
    GetDailyTaskByEmpId: "/DailyTask/GetDailyTaskByEmpId/{id}",
    SaveDailyTask: "/DailyTask/Save",
    DeleteDailyTask: "/DailyTask/Delete/{id}",
    UploadDailyTaskExcel: "/DailyTask/upload-DailyTaskExcel",

    // TimeEntry
    GetAllTimeEntries: "/TimeEntry/GetAllTimeEntries",
    GetTimeEntryById: "/TimeEntry/GetTimeEntry/{id}",
    SaveTimeEntry: "/TimeEntry/Save",
    DeleteTimeEntry: "/TimeEntry/Delete/{id}"


}

