import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../environmentts/environment';

@Injectable({ providedIn: 'root' })
export class LeaveNotificationService {
  private adminPendingCountSubject = new BehaviorSubject<number>(0);
  private managerPendingCountSubject = new BehaviorSubject<number>(0);

  adminPendingCount$ = this.adminPendingCountSubject.asObservable();
  managerPendingCount$ = this.managerPendingCountSubject.asObservable();

  setAdminPendingCount(count: number) {
    this.adminPendingCountSubject.next(count);
  }

  setManagerPendingCount(count: number) {
    this.managerPendingCountSubject.next(count);
  }

  getAdminPendingCount(): number {
    return this.adminPendingCountSubject.value;
  }

  getManagerPendingCount(): number {
    return this.managerPendingCountSubject.value;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  // ---------------------------
  // Authentication & account
  // ---------------------------
  login(payload: { email: string; password: string }): Observable<any> {
    const url = `${environment.baseurl}${environment.GetLogin}`;
    return this.http.post<any>(url, payload).pipe(
      map(res => {
        if (res && res.token) {
          sessionStorage.setItem('authToken', res.token);
        }
        return res;
      })
    );
  }

  forgotPassword(payload: { Email: string }): Observable<any> {
    const url = `${environment.baseurl}${environment.GetForgotPassword}`;
    return this.http.post<any>(url, payload).pipe(map(res => res));
  }

  verifyOtp(payload: { Email: string; Otp: string }): Observable<any> {
    const url = `${environment.baseurl}${environment.VerifyOtp}`;
    return this.http.post<any>(url, payload).pipe(map(res => res));
  }

  resetPassword(payload: { Email: string; NewPassword: string; ConfirmPassword: string }): Observable<any> {
    const url = `${environment.baseurl}${environment.ResetPassword}`;
    return this.http.post<any>(url, payload).pipe(map(res => res));
  }

  verifyOldPassword(payload: { Email: string; OldPassword: string }): Observable<any> {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.VerifyOldPassword}`;
    return this.http.post<any>(url, payload, { headers }).pipe(map(res => res));
  }

  changePassword(payload: { Email: string; OldPassword: string; NewPassword: string; ConfirmPassword: string }): Observable<any> {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.ChangePassword}`;
    return this.http.post<any>(url, payload, { headers }).pipe(map(res => res));
  }

  // ---------------------------
  // Generic helpers
  // ---------------------------
  private authHeaders() {
    const token = sessionStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  }

  // ---------------------------
  // Roles & user info
  // ---------------------------
  // Master list of roles (id/name)
  getAllRoles(): Observable<any> {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetAllRoles}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  /**
   * getUserByEmpId
   * Uses your existing GetUserById environment key (which expects '{id}')
   * This replaces the non-existent GetUserByEmpId env key.
   */
  getUserByEmpId(empId: string | null): Observable<any> {
    if (!empId) {
      throw new Error('empId required');
    }
    const headers = this.authHeaders();
    // Use existing GetUserById (replace {id} placeholder)
    const url = `${environment.baseurl}${environment.GetUserById.replace('{id}', empId.toString())}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  /**
   * getUserRoles
   * If your backend has a dedicated GetUserRoles endpoint you can add it to environment and
   * replace the implementation. For now we fetch the user (GetUserById) and try to extract
   * common role properties (roles, roleIds, userRoles).
   */
  getUserRoles(empId: string | null): Observable<any> {
    if (!empId) {
      throw new Error('empId required');
    }
    // Call the single-user endpoint and map to roles array (if present)
    return this.getUserByEmpId(empId).pipe(
      map(user => {
        // Try common fields your API might return
        if (!user) return [];
        if (Array.isArray(user.roles)) return user.roles;
        if (Array.isArray(user.roleIds)) return user.roleIds;
        if (Array.isArray(user.userRoles)) return user.userRoles;
        // If user has a single role name/id field
        if (user.role) return [user.role];
        if (user.roleId) return [user.roleId];
        // Fallback empty
        return [];
      })
    );
  }

  // Convenience: use empId from sessionStorage
  getCurrentUserRoles(): Observable<any> {
    const empId = sessionStorage.getItem('empId');
    return this.getUserRoles(empId);
  }

  // ---------------------------
  // Company / lookup helpers
  // ---------------------------
  getUsersByCompany(companyId: number) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetUsersByComapanyId.replace('{companyId}', companyId.toString())}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  getCompanyById(companyId: number) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetCompanyById.replace('{companyId}', companyId.toString())}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  getDepartmentName(departmentId: number) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetDepartmentName.replace('{departmentId}', departmentId.toString())}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  getDesignationName(designationId: number) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetDesignationName.replace('{designationId}', designationId.toString())}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  getRoleName(roleId: number) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetRoleName.replace('{roleId}', roleId.toString())}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  // ---------------------------
  // Departments / designations / roles lists
  // ---------------------------
  getAllDepartments() {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetAllDepartments}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  getAllDesignations() {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetAllDesignations}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  // ---------------------------
  // Office / address
  // ---------------------------
  getOfficeAddressById(id: number) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetOfficeAddressById.replace('{id}', id.toString())}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  // ---------------------------
  // Weekly Timesheet
  // ---------------------------
  saveWeeklyTimesheet(payload: any) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.SaveWeeklyTimesheet}`;
    return this.http.post<any>(url, payload, { headers }).pipe(map(res => res));
  }

  getWeeklyTimesheet() {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetWeeklyTimesheet}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  GetAllTimesheetLeave() {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetAllTimesheetLeave}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }
   getLeaveMonthData(month: string): Observable<any> {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetLeaveMonthData.replace('{month}', month)}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  saveTimesheetLeave(payload: any) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.SaveTimesheetLeave}`;
    return this.http.post<any>(url, payload, { headers }).pipe(map(res => res));
  }

  // ---------------------------
  // Users CRUD
  // ---------------------------
  getAllUsers() {
    const headers = this.authHeaders();
    return this.http.get<any>(`${environment.baseurl}${environment.GetAllUsers}`, { headers }).pipe(map(res => res));
  }

  getUserById(id: string) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetUserById.replace('{id}', id.toString())}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  saveUser(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.baseurl}${environment.SaveUser}`, payload).pipe(map(res => res));
  }

  deleteUser(id: string) {
    return this.http.get<any>(`${environment.baseurl}${environment.DeleteUser.replace('{id}', id.toString())}`).pipe(map(res => res));
  }

  // ---------------------------
  // Attendance
  // ---------------------------
  getAllAttendances() {
    const headers = this.authHeaders();
    return this.http.get<any>(`${environment.baseurl}${environment.GetAllAttendances}`, { headers }).pipe(map(res => res));
  }

  getAttendanceById(id: number) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetAttendanceById.replace('{id}', id.toString())}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  getAttendanceByEmpId(id: string) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetAttendanceByEmpId.replace('{id}', id)}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  saveAttendance(payload: any) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.SaveAttendance}`;
    return this.http.post<any>(url, payload, { headers }).pipe(map(res => res));
  }

  saveAttendanceRegularization(payload: any) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.SaveAttendanceRegularization}`;
    return this.http.post<any>(url, payload, { headers }).pipe(map(res => res));
  }

  // ---------------------------
  // Leave Application
  // ---------------------------
  getAllLeaveRequests() {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetAllLeaveRequests}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  getLeaveRequestById(id: number) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetLeaveRequestById.replace('{id}', id.toString())}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  getLeaveRequestByEmpId(id: string) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetLeaveRequestByEmpId.replace('{id}', id)}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  saveLeaveRequest(payload: any) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.SaveLeaveRequest}`;
    return this.http.post<any>(url, payload, { headers }).pipe(map(res => res));
  }

  deleteLeaveRequest(id: number) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.DeleteLeaveRequest.replace('{id}', id.toString())}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  // Leave counts (already present)
  getAllLeaveCounts() {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetAllLeaveCounts}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  // ---------------------------
  // Daily Tasks
  // ---------------------------
  getAllDailyTasks() {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetAllDailyTasks}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  getDailyTaskById(id: number) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetDailyTaskById.replace('{id}', id.toString())}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  getDailyTaskByEmpId(id: string) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetDailyTaskByEmpId.replace('{id}', id)}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  saveDailyTask(payload: any) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.SaveDailyTask}`;
    return this.http.post<any[]>(url, payload, { headers }).pipe(map(res => res));
  }

  uploadDailyTaskExcel(file: File) {
    const headers = this.authHeaders();
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(
      `${environment.baseurl}${environment.UploadDailyTaskExcel}`,
      formData,
      {
        headers,
        reportProgress: true,
        observe: 'events'
      }
    );
  }

  deleteDailyTask(id: number) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.DeleteDailyTask.replace('{id}', id.toString())}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  // ---------------------------
  // Holiday
  // ---------------------------
  getAllHolidays() {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetAllHolidays}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  getHolidayById(id: number) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.GetHolidayById.replace('{id}', id.toString())}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }

  saveHoliday(payload: any) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.SaveHoliday}`;
    return this.http.post<any>(url, payload, { headers }).pipe(map(res => res));
  }

  deleteHoliday(id: number) {
    const headers = this.authHeaders();
    const url = `${environment.baseurl}${environment.DeleteHoliday.replace('{id}', id.toString())}`;
    return this.http.get<any>(url, { headers }).pipe(map(res => res));
  }
}
