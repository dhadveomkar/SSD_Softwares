import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { ApiService } from '../../../services/services';


interface User {
  empId: string;
  managerId: string | null;
  isManagerAssigned: boolean;
  userName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  address: string;
  mobileNumber: string;
  dateOfBirth: string;
  department: string;
  role: string;
  designation: string;
  joiningDate: string;
  reportingManager: string;
  companyName: string;
  companyId?: number | null;
  holiday: string;
  timesheet: string;
  departmentId?: number | null;
  designationId?: number | null;
  roleId?: number | null;
  reportingManagerName?: string | null;
}

@Component({
  selector: 'app-create-page',
  standalone: true,
  imports: [FormsModule, CommonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.css']
})
export class CreatePageComponent {
  // Helper to safely get uploaded file name from the file input
  get uploadedFileName(): string {
    const input = document.getElementById('csvFileInputModal') as HTMLInputElement | null;
    if (input && input.files && input.files.length > 0) {
      return input.files[0].name;
    }
    return '';
  }
  /**
   * Transform a raw employee object from upload to the expected format
   */
  // Returns a download URL for the uploaded file
  getUploadedFileUrl(input: HTMLInputElement): string {
    if (input && input.files && input.files.length > 0) {
      return URL.createObjectURL(input.files[0]);
    }
    return '';
  }
  transformEmployeePayload(raw: any): User {
    // Helper to convert Excel serial date to yyyy-MM-dd
    function excelSerialToDate(serial: any): string {
      if (typeof serial === 'number') {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const days = Math.floor(serial);
        const ms = days * 24 * 60 * 60 * 1000;
        const date = new Date(excelEpoch.getTime() + ms);
        return date.toISOString().split('T')[0];
      }
      return '';
    }

    // Helper to normalize date string
    function normalizeDate(val: any): string {
      if (val === null || val === undefined || val === '' || val === '-') return '';
      if (typeof val === 'number') return excelSerialToDate(val);
      if (typeof val === 'string') {
        // Accept common ISO-like strings including "2025-11-04T00:00:00" or "2025-11-04 00:00:00"
        const trimmed = val.trim();
        // If string starts with yyyy-mm-dd, extract just the date part quickly
        const isoDateMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
        if (isoDateMatch) return isoDateMatch[1];

        // Fallback: try Date parse
        const d = new Date(trimmed);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
      }
      return '';
    }

    // Helper to normalize string/null
    function normalize(val: any): string {
      if (val === null || val === undefined || val === '' || val === '-') return '';
      return String(val);
    }
    // match dropdrown value
    function normalizeDropdown(val: any, validOptions: string[]): string {
  if (!val) return '';
  const lowerVal = String(val).trim().toLowerCase();
  const match = validOptions.find(opt => opt.toLowerCase() === lowerVal);
  return match || '';
}

    // helper to parse numeric IDs - return number or null
    function parseId(val: any): number | null {
      if (val === null || val === undefined || val === '' || val === '-') return null;
      const n = Number(String(val).trim());
      return isNaN(n) ? null : n;
    }

    // Map fields
    return {
      empId: normalize(raw['Employee ID'] ?? raw['empId']),
      // managerId: try numeric ID first; otherwise leave empty so we can resolve name later
      managerId: (() => {
        const rawVal = raw['managerId'] ?? raw['ManagerId'] ?? raw['Reporting Manager'] ?? raw['reportingManager'];
        const parsed = parseId(rawVal);
        return parsed !== null ? String(parsed) : '';
      })(),
      // Keep the original reporting manager value (name or id) so we can resolve names -> empId later
      reportingManagerName: normalize(raw['Reporting Manager'] ?? raw['reportingManager'] ?? raw['managerName'] ?? raw['Manager Name']),
      isManagerAssigned: !!(raw['Reporting Manager'] ?? raw['managerId'] ?? raw['reportingManager']),
      userName: normalize(raw['User Name'] ?? raw['userName']),
      firstName: normalize(raw['First Name'] ?? raw['firstName']),
      middleName: normalize(raw['Middle Name'] ?? raw['middleName']),
      lastName: normalize(raw['Last Name'] ?? raw['lastName']),
      email: normalize(raw['Email'] ?? raw['email']),
      password: normalize(raw['Password'] ?? raw['password']),
      // gender: normalize(raw['Gender'] ?? raw['gender']),
      address: normalize(raw['Address'] ?? raw['address']),
      mobileNumber: normalize(raw['Mobile Number'] ?? raw['mobileNumber']),
      dateOfBirth: normalizeDate(raw['Date of Birth'] ?? raw['dateOfBirth']),
      department: normalize(raw['Department'] ?? raw['department']),
      // role: normalize(raw['Role'] ?? raw['role']),
      designation: normalize(raw['Designation'] ?? raw['designation']),
      joiningDate: normalizeDate(raw['Joining Date'] ?? raw['joiningDate']),
      // reportingManager: normalize(raw['Reporting Manager'] ?? raw['reportingManager']),
      companyName: normalize(raw['Company Name'] ?? raw['companyName']),
      // numeric ids: prefer explicit columns if present in file
      companyId: parseId(raw['CompanyId'] ?? raw['Company Id'] ?? raw['companyId'] ?? raw['companyID']),
      departmentId: parseId(raw['DepartmentId'] ?? raw['Department Id'] ?? raw['departmentId'] ?? raw['departmentID']),
      designationId: parseId(raw['DesignationId'] ?? raw['Designation Id'] ?? raw['designationId'] ?? raw['designationID']),
      roleId: parseId(raw['RoleId'] ?? raw['Role Id'] ?? raw['roleId'] ?? raw['roleID']),
      // holiday: normalize(raw['Holiday'] ?? raw['holiday']),
      // Timesheet: normalize(raw['Timesheet'] ?? raw['timesheet'] ?? raw['timeSheet']),

      gender: normalizeDropdown(raw['Gender'] ?? raw['gender'], ['Male', 'Female', 'Other']),
      holiday: normalizeDropdown(raw['Holiday'] ?? raw['holiday'],['SSD','Ennovate-Maharashtra','Ennovate-Non-Maharshtra']),
      role: normalizeDropdown(raw['Role'] ?? raw['role'],['Admin','Manager','User']),
      timesheet: normalizeDropdown(raw['TimeSheet'] ?? raw['timesheet'], ['Daily','Weekly']),
    // keep legacy reportingManager for UI compatibility if needed (set to empty — we'll set managerId explicitly)
    reportingManager: ''



    };

  }
  
  showUploadModal = false;
  pendingEmployees: any[] = [];
  // Handle drag-and-drop file upload in modal
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const fileInput = document.querySelector<HTMLInputElement>("#csvFileInputModal");
      if (fileInput) {
        // Set files to input and trigger change event
        fileInput.files = event.dataTransfer.files;
        const changeEvent = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(changeEvent);
        this.showUploadModal = false;
      }
    }
  }
  // Handle CSV or Excel file selection and parse only
  onCsvFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No file selected.',
        life: 4000
      });
      this.pendingEmployees = [];
      return;
    }
    const file = input.files[0];
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.xlsx')) {
      // Excel file handling
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        let jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        if (jsonData.length === 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Excel file is empty.',
            life: 4000
          });
          this.pendingEmployees = [];
          return;
        }
        // Convert Excel serial date numbers to ISO strings for dateOfBirth and joiningDate
        jsonData = jsonData.map(emp => {
          ['dateOfBirth', 'joiningDate'].forEach(field => {
            if (emp[field] && typeof emp[field] === 'number') {
              // Excel date serial to JS Date
              const excelEpoch = new Date(Date.UTC(1899, 11, 30));
              const days = Math.floor(emp[field]);
              const ms = days * 24 * 60 * 60 * 1000;
              const date = new Date(excelEpoch.getTime() + ms);
              emp[field] = date.toISOString().split('T')[0] + 'T00:00:00';
            }
          });
          return emp;
        });
        this.pendingEmployees = jsonData;
        this.showToastSuccess('File uploaded successfully.', 3000);
      };
      reader.readAsArrayBuffer(file);
    } else if (fileName.endsWith('.csv')) {
      // CSV file handling
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const csvText = e.target.result;
        const lines = csvText.split(/\r?\n/).filter((line: string) => line.trim() !== '');
        if (lines.length === 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'CSV file is empty.',
            life: 4000
          });
          this.pendingEmployees = [];
          return;
        }
   
        // Required fields in order (A, B, C, ...)
        const requiredHeaders = ['empId', 'managerId', 'isManagerAssigned', 'userName', 'firstName', 'middleName', 'lastName', 'email', 'password', 'gender', 'mobileNumber', 'dateOfBirth', 'department', 'role', 'designation', 'joiningDate', 'reportingManager'];
;
        let employees: any[] = [];
        // Detect header by checking if first row contains any of the required field names
        const firstLine = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
        const hasHeader = requiredHeaders.some(h => firstLine.includes(h.toLowerCase()));
        if (hasHeader) {
          // Use header mapping as before
          const headers = lines[0].split(',').map((h: string) => h.trim());
          const missingHeaders = ['empId', 'userName', 'firstName', 'lastName', 'email', 'password', 'gender', 'mobileNumber', 'dateOfBirth', 'department', 'role', 'designation', 'joiningDate', 'reportingManager','timesheet'].filter((h: string) => !headers.includes(h));
          if (missingHeaders.length > 0) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Missing required columns: ' + missingHeaders.join(', '),
              life: 4000
            });
            this.pendingEmployees = [];
            return;
          }
          employees = lines.slice(1).map((line: string) => {
            const values = line.split(',');
            const employee: any = {};
            headers.forEach((header: string, idx: number) => {
              if (header === 'dateOfBirth' || header === 'joiningDate') {
                let dateVal = values[idx] ? values[idx].trim() : '';
                if (dateVal && dateVal.includes('/')) {
                  const parts = dateVal.split('/');
                  if (parts.length === 3) {
                    const yyyy = parts[2].length === 4 ? parts[2] : '20' + parts[2];
                    const mm = parts[0].padStart(2, '0');
                    const dd = parts[1].padStart(2, '0');
                    dateVal = `${yyyy}-${mm}-${dd}`;
                  }
                }
                employee[header] = dateVal;
              } else {
                employee[header] = values[idx] ? values[idx].trim() : '';
              }
            });
            // Always set 'user' field from userName or email
            employee.user = employee.userName ? employee.userName : (employee.email ? employee.email : '');
            return employee;
          });
        } else {
          // No header: map columns by fixed order (A, B, C, ...)
          employees = lines.map((line: string) => {
            const values = line.split(',');
            const employee: any = {};
            const fieldOrder = [
              'empId',
              'managerId',
              'isManagerAssigned',
              'userName',
              'firstName',
              'middleName',
              'lastName',
              'email',
              'password',
              'gender',
              'address',
              'mobileNumber',
              'dateOfBirth',
              'department',
              'designation',
              'timesheet',
              'role',
              'joiningDate',
              'reportingManager'
            ];
              fieldOrder.forEach((field: string, idx: number) => {
              if (field === 'isManagerAssigned') {
                const val = values[idx] ? values[idx].trim().toLowerCase() : '';
                employee[field] = (val === '1' || val === 'true') ? true : false;
              } else if (field === 'dateOfBirth' || field === 'joiningDate') {
                let dateVal = values[idx] ? values[idx].trim() : '';
                if (dateVal && dateVal.includes('/')) {
                  const parts = dateVal.split('/');
                  if (parts.length === 3) {
                    const yyyy = parts[2].length === 4 ? parts[2] : '20' + parts[2];
                    const mm = parts[0].padStart(2, '0');
                    const dd = parts[1].padStart(2, '0');
                    dateVal = `${yyyy}-${mm}-${dd}`;
                  }
                }
                employee[field] = dateVal;
              } else {
                employee[field] = values[idx] ? values[idx].trim() : '';
              }
            });
            employee.user = employee.userName ? employee.userName : (employee.email ? employee.email : '');
            return employee;
          });
        }
        this.pendingEmployees = employees;
        this.showToastSuccess('File upload successfully.', 3000);
      };
      reader.readAsText(file);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unsupported file type. Please upload a CSV or Excel file.',
        life: 4000
      });
      this.pendingEmployees = [];
    }
  }
  // Called when user clicks Proceed in modal
  onProceedUpload() {
    if (!this.pendingEmployees || this.pendingEmployees.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'File not uploaded please upload a file first.',
        life: 3000
      });
      return;
    }
    // Transform all employees to expected format before upload
    const transformed = this.pendingEmployees.map(emp => this.transformEmployeePayload(emp));
    this.processEmployeeUpload(transformed);
    this.pendingEmployees = [];
    this.showUploadModal = false;
  }

  // Common upload logic for both CSV and Excel
  private processEmployeeUpload(employees: any[]) {
    if (!employees || employees.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No employee data found in file.',
        life: 4000
      });
      return;
    }
    // Print parsed employees to console for debugging
    console.log('Parsed employees from file:', employees);
    // Fetch all users once for duplicate check
    this.apiService.getAllUsers().subscribe({
      next: (existingUsers: any[]) => {
        let successCount = 0;
        let errorCount = 0;
        let duplicateCount = 0;
        // collect failure details so we can show meaningful toast messages
        const failedRecords: Array<{ emp: any; reason: string }> = [];
        const total = employees.length;
        // helper to contain the actual per-employee loop that saves records
        const processLoop = () => {
          const navigateToList = () => {
            setTimeout(() => {
              this.router.navigate(['/employee-list']);
            }, 3000);
          };

          employees.forEach((emp: any) => {
            const empIdExists = existingUsers.some(u => u.empId === emp.empId);
            const userNameExists = existingUsers.some(u => u.userName === emp.userName);
            const emailExists = existingUsers.some(u => u.email === emp.email);
            if (empIdExists || userNameExists || emailExists) {
              duplicateCount++;
              errorCount++;
              // build a helpful reason string
              const reasons: string[] = [];
              if (empIdExists) reasons.push('empId already exists');
              if (userNameExists) reasons.push('username already exists');
              if (emailExists) reasons.push('email already exists');
              failedRecords.push({ emp, reason: reasons.join(', ') || 'duplicate' });
              if (successCount + errorCount === total) {
                // Build a descriptive message summarizing duplicates/fails
                if (successCount === 0) {
                  const failedCount = failedRecords.length;
                  let detailMessage = `No new employees created. ${failedCount} record${failedCount>1?'s':''} already exist.`;
                  if (failedCount > 0) {
                    const examples = failedRecords.slice(0, 5).map(f => `${f.emp?.empId ?? f.emp?.userName ?? f.emp?.email ?? '(unknown)'}: ${f.reason}`);
                    detailMessage += ' Examples: ' + examples.join(' | ');
                  }
                  this.messageService.add({ severity: 'error', summary: 'No records created', detail: detailMessage, life: 7000 });
                  navigateToList();
                } else {
                  this.showToastSuccess(`Creating ${successCount} employees details successfully.`);
                  if (failedRecords.length > 0) {
                    // Also show which ones were skipped
                    const failedCount = failedRecords.length;
                    const examples = failedRecords.slice(0, 5).map(f => `${f.emp?.empId ?? f.emp?.userName ?? f.emp?.email ?? '(unknown)'}: ${f.reason}`);
                    this.messageService.add({ severity: 'warn', summary: `${failedCount} skipped`, detail: examples.join(' | '), life: 7000 });
                  }
                  navigateToList();
                }
              }
              return;
            }
            this.apiService.saveUser(emp).subscribe({
              next: () => {
                successCount++;
                if (successCount + errorCount === total) {
                  this.showToastSuccess(`Creating ${successCount} employees details successfully.`);
                  navigateToList();
                }
              },
              error: (err: any) => {
                errorCount++;
                // try to extract a useful message from the server response
                let reason = 'Unknown error';
                try {
                  const server = err && (err.error ?? err);
                  // common shapes: { message }, { errors: [...] }, statusText, or string
                  if (server) {
                    if (typeof server === 'string') reason = server;
                    else if (server.message) reason = String(server.message);
                    else if (server.errors) reason = Array.isArray(server.errors) ? server.errors.join('; ') : JSON.stringify(server.errors);
                    else reason = JSON.stringify(server).slice(0, 200);
                  } else if (err && err.statusText) {
                    reason = String(err.statusText);
                  }
                } catch (e) {
                  reason = 'Failed to parse server error';
                }
                failedRecords.push({ emp, reason });
                if (successCount + errorCount === total) {
                  // Build a more informative failure message
                  const failedCount = failedRecords.length;
                  let detailMessage = `Failed to upload ${failedCount} record${failedCount>1?'s':''}.`;
                  // include up to 3 example reasons for quick diagnostics
                  if (failedCount > 0) {
                    const examples = failedRecords.slice(0, 3).map(f => {
                      const id = f.emp?.empId ?? f.emp?.userName ?? f.emp?.email ?? '(unknown)';
                      return `${id}: ${f.reason}`;
                    });
                    detailMessage += ' Examples: ' + examples.join(' | ');
                  }

                  this.messageService.add({
                    severity: 'error',
                    summary: 'Upload failed',
                    detail: detailMessage,
                    life: 7000
                  });
                 // navigateToList();
                }
              }
            });
          });
        };
        forkJoin({
          departments: this.apiService.getAllDepartments(),
          designations: this.apiService.getAllDesignations(),
          roles: this.apiService.getAllRoles()
        }).subscribe({
          next: (lookups: any) => {
            // normalize the lookup arrays
            const normalizeList = (raw: any) => {
              if (!raw) return [];
              if (Array.isArray(raw)) return raw;
              if (Array.isArray(raw.data)) return raw.data;
              return [];
            };

            const depts = normalizeList(lookups.departments);
            const desigs = normalizeList(lookups.designations);
            const roles = normalizeList(lookups.roles);

            const deptMap = new Map<string, number>();
            depts.forEach((d: any) => {
              const name = String(d.departmentName ?? d.name ?? d.deptName ?? '').trim().toLowerCase();
              const id = Number(d.departmentId ?? d.id ?? d.deptId ?? NaN);
              if (name) deptMap.set(name, id);
            });

            const desigMap = new Map<string, number>();
            desigs.forEach((d: any) => {
              const name = String(d.designationName ?? d.name ?? d.title ?? '').trim().toLowerCase();
              const id = Number(d.designationId ?? d.id ?? d.desigId ?? NaN);
              if (name) desigMap.set(name, id);
            });

            const roleMap = new Map<string, number>();
            roles.forEach((r: any) => {
              const name = String(r.roleName ?? r.name ?? r.title ?? '').trim().toLowerCase();
              const id = Number(r.roleId ?? r.id ?? NaN);
              if (name) roleMap.set(name, id);
            });

            // Now iterate employees and map names to ids where missing
            employees.forEach((emp: any) => {
              // Company: prefer companyId already parsed; otherwise try sessionCompany if matches
              if (!emp.companyId) {
                const sessionName = (this.sessionCompany || '').toLowerCase();
                const fileName = String(emp.companyName || '').trim().toLowerCase();
                const sessionCompanyId = sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : NaN;
                if (fileName && sessionName && fileName === sessionName && !isNaN(sessionCompanyId)) {
                  emp.companyId = sessionCompanyId;
                } else {
                  emp.companyId = null; // let backend resolve by name if supported
                }
              }

              // Department: keep explicit id if present, otherwise try name match
              if (!emp.departmentId) {
                const depName = String(emp.department ?? '').trim().toLowerCase();
                emp.departmentId = depName && deptMap.has(depName) ? deptMap.get(depName) ?? null : null;
              }

              // Designation
              if (!emp.designationId) {
                const desName = String(emp.designation ?? '').trim().toLowerCase();
                emp.designationId = desName && desigMap.has(desName) ? desigMap.get(desName) ?? null : null;
              }

              // Role
              if (!emp.roleId) {
                const rName = String(emp.role ?? '').trim().toLowerCase();
                emp.roleId = rName && roleMap.has(rName) ? roleMap.get(rName) ?? null : null;
              }

              // Reporting manager: try to resolve provided name -> empId using the existingUsers list
              if (!emp.managerId || emp.managerId === '') {
                const rmRaw = String(emp.reportingManagerName ?? emp.reportingManager ?? '').trim().toLowerCase();
                if (rmRaw) {
                  // Build a quick map of fullName/username/email -> empId from the existingUsers array
                  const managerMap = new Map<string, string>();
                  existingUsers.forEach((u: any) => {
                    const parts = [u.firstName, u.middleName, u.lastName].filter(Boolean).map((x: any) => String(x).trim()).join(' ').toLowerCase();
                    if (parts) managerMap.set(parts, u.empId);
                    const short = `${(u.firstName||'').trim().toLowerCase()} ${(u.lastName||'').trim().toLowerCase()}`.trim();
                    if (short) managerMap.set(short, u.empId);
                    if (u.userName) managerMap.set(String(u.userName).trim().toLowerCase(), u.empId);
                    if (u.email) managerMap.set(String(u.email).trim().toLowerCase(), u.empId);
                  });

                  if (managerMap.has(rmRaw)) {
                    emp.managerId = managerMap.get(rmRaw) || '';
                    // keep reportingManager (legacy) populated with resolved empId
                    emp.reportingManager = emp.managerId;
                  } else {
                    // fallback: try to find using loose matching in existingUsers
                    const found = existingUsers.find((u: any) => {
                      const full = [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ').trim().toLowerCase();
                      const short = `${(u.firstName||'').trim().toLowerCase()} ${(u.lastName||'').trim().toLowerCase()}`.trim();
                      return full === rmRaw || short === rmRaw || (u.userName && String(u.userName).trim().toLowerCase() === rmRaw) || (u.email && String(u.email).trim().toLowerCase() === rmRaw);
                    });
                    emp.managerId = found ? found.empId : '';
                    emp.reportingManager = emp.managerId;
                  }
                } else {
                  emp.managerId = '';
                  emp.reportingManager = '';
                }
              }

              // Ensure isManagerAssigned reflects the resolved managerId
              emp.isManagerAssigned = !!emp.managerId;
            });

            // proceed with the previously implemented upload loop using the enriched employees
            processLoop();
          },
          error: () => {
            // If lookup fetch fails, proceed without mapping (IDs will be null)
            employees.forEach((emp: any) => {
              if (!emp.companyId) emp.companyId = null;
              if (!emp.departmentId) emp.departmentId = null;
              if (!emp.designationId) emp.designationId = null;
              if (!emp.roleId) emp.roleId = null;
            });
            processLoop();
          }
        });

      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to check for duplicates.',
          life: 3000
        });
      }
    });
  }
  showPassword = false;
  // Prevent non-digit characters in mobile number input
  onMobileNumberInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;
    // Remove all non-digit characters
    input.value = input.value.replace(/\D/g, '');
    this.formData.mobileNumber = input.value;
  }
  // Mark all form fields as touched to show validation errors
  markFormFieldsTouched(form: any) {
    if (form && form.controls) {
      Object.values(form.controls).forEach((control: any) => {
        control.markAsTouched();
      });
    }
  }
  today = new Date().toISOString().split('T')[0];

  // Returns true if the given date string (yyyy-MM-dd) is in the future compared to today
  isFutureDate(date: string): boolean {
    if (!date) return false;
    const inputDate = new Date(date);
    const todayDate = new Date(this.today);
    // Remove time part for strict date comparison
    inputDate.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);
    return inputDate > todayDate;
  }

  // Prevent typing more than 4 digits in year for date of birth
  onDateOfBirthInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input || typeof input.value !== 'string') return;
    const value = input.value;
    // Only allow yyyy-MM-dd, block if year > 4 digits
    const match = value.match(/^(\d{4})(\d*)-(\d{0,2})-(\d{0,2})$/);
    if (match && match[2] && match[2].length > 0) {
      // Remove extra digits from year
      input.value = match[1] + '-' + match[3] + '-' + match[4];
      this.formData.dateOfBirth = input.value;
    }
  }

  // Prevent typing more than 4 digits in year for joining date
  onJoiningDateInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input || typeof input.value !== 'string') return;
    const value = input.value;
    // Only allow yyyy-MM-dd, block if year > 4 digits
    const match = value.match(/^(\d{4})(\d*)-(\d{0,2})-(\d{0,2})$/);
    if (match && match[2] && match[2].length > 0) {
      // Remove extra digits from year
      input.value = match[1] + '-' + match[3] + '-' + match[4];
      this.formData.joiningDate = input.value;
    }
  }
  showToastSuccess(message: string, life: number = 3000) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: life
    });
  }
  loggedInRole: string = '';
  router = inject(Router);
  apiService = inject(ApiService);
  messageService = inject(MessageService);

  isViewMode: boolean = false;
  isEditMode: boolean = false;
  originalData: any = null;
  managers: User[] = []; // Store the full manager objects

  formData: any = {
    empId: '',
    managerId: '',
    isManagerAssigned: false,
    firstName: '',
    middleName: '',
    lastName: '',
    userName: '',
    dateOfBirth: '',
    mobileNumber: '',
    gender: '',
    address: '',
    email: '',
    department: '',
    departmentId: undefined,
    designation: '',
    designationId: undefined,
    joiningDate: '',
    reportingManager: '',
    role: '',
    roleId: undefined,
    password: '',
    companyName: '',
    companyId: NaN,
    holiday: '',
    timesheet: '',
  };

  genders = [
    { label: 'Malle', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' }
  ];

  roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
    { label: 'Manager', value: 'manager' }
  ];
  timeSheets = [
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' }
];


  // The currently visible (filtered) options bound to the template
  holidayOptions: string[] = [];

  // Keep raw server list cached separately so we never render the full list without
  // applying the company filter first.
  private holidayAllOptions: string[] = [];

  // If a user's holiday set is enforced via sessionStorage, lock the holiday select
  holidayLocked: boolean = false;

  // Flags used to avoid refetching and to show a loading placeholder while fetching
  private holidayLoaded: boolean = false;
  holidayLoading: boolean = false;

  // session company (if set) — used to prefill and lock companyName
  sessionCompany: string = (sessionStorage.getItem('companyName') || '').toString().trim();

  // company details fetched during create/edit (if CompanyId available in session)
  companyDetails: { companyId?: number | string; companyName?: string; startDate?: string; endDate?: string } | null = null;

  // resolved names from lookup APIs (department, designation, role)
  resolvedDepartmentName: string | null = null;
  resolvedDesignationName: string | null = null;
  resolvedRoleName: string | null = null;

  // available departments loaded on page open (store objects so we can use id+name)
  departmentsList: Array<{ departmentId: number; departmentName: string }> = [];
  // available designations and roles
  // designationsList will hold objects {designationId, designationName}
  // allDesignations keeps the master list returned from the API and may include department association
  designationsList: Array<{ designationId: number; designationName: string; departmentId?: number }> = [];
  private allDesignations: Array<{ designationId: number; designationName: string; departmentId?: number }> = [];
  // rolesList will hold objects with id and name so we can keep ID and name separate
  rolesList: Array<{ roleId: number; roleName: string }> = [];

  // Set managerId and reportingManager when a manager is selected
  setReportingManager(selectedManagerEmpId: string) {
    this.formData.managerId = selectedManagerEmpId;
    this.formData.reportingManager = selectedManagerEmpId;
    this.formData.isManagerAssigned = !!selectedManagerEmpId;
  console.log('reportingManager');
    
  }

  // Fetch holidays from API when select box is clicked
  // If sessionCompany is set (e.g. 'Ennovate') we only show holiday sets that include
  // at least one token from the sessionCompany name (case-insensitive substring match).
  fetchHolidayOptions(forceReload: boolean = false) {
    // If we already loaded holiday data and not forcing reload, do nothing — avoids flicker
    if (this.holidayLoaded && !forceReload) return;
    if (this.holidayLoading) return;
    this.holidayLoading = true;

    this.apiService.getAllHolidays().subscribe({
      next: (existing: any[]) => {
        this.holidayLoading = false;
        this.holidayLoaded = true;

        if (Array.isArray(existing) && existing.length > 0) {
          // Map to string names and remove duplicates
          this.holidayAllOptions = Array.from(new Set(existing.map(h => String(h.holidaySet ?? h).trim()).filter(Boolean)));

          // Build tokens from sessionCompany (split on whitespace) for matching
          const sessionVal = (this.sessionCompany || '').trim();
          const tokens = sessionVal ? sessionVal.split(/\s+/).map(t => t.toLowerCase()).filter(Boolean) : [];

          let filtered: string[];
          if (tokens.length > 0) {
            // Keep only holiday names that include at least one session token (case-insensitive)
            filtered = this.holidayAllOptions.filter(name => {
              const lower = String(name).toLowerCase();
              return tokens.some(tok => lower.includes(tok));
            });
            // If there are no matches we intentionally do NOT fallback to the full list
            // (this prevents showing all options when the company filter is active).
          } else {
            filtered = [...this.holidayAllOptions];
          }

          // Store the filtered list in holidayOptions (this is what template renders)
          this.holidayOptions = Array.from(new Set(filtered));

          // If form currently has a holiday value, try to keep exact-casing from the list
          if (this.formData.holiday) {
            const match = this.holidayOptions.find(h => h.toLowerCase() === String(this.formData.holiday).toLowerCase());
            if (match) this.formData.holiday = match;
            // If there was a holiday set in form but it's not present in the filtered options and
            // the holiday is locked from session, keep it. Otherwise clear it to avoid showing
            // an invalid option in the select.
            else if (!this.holidayLocked) this.formData.holiday = '';
          }
        }
        else {
          // no items returned — make sure loading state cleared and lists are empty
          this.holidayAllOptions = [];
          this.holidayOptions = [];
        }
      },
      error: () => {
        this.holidayLoading = false;
        this.holidayLoaded = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load holiday options.',
          life: 3000
        });
      }
    });
  }

  // Re-apply the session-company filter to the cached list and update holidayOptions
  private applyHolidayFilter() {
    const raw = Array.isArray(this.holidayAllOptions) ? this.holidayAllOptions : [];
    if (!raw.length) {
      this.holidayOptions = [];
      return;
    }

    const sessionVal = (this.sessionCompany || '').trim();
    const tokens = sessionVal ? sessionVal.split(/\s+/).map(t => t.toLowerCase()).filter(Boolean) : [];

    if (tokens.length > 0) {
      const filtered = raw.filter(name => {
        const lower = String(name).toLowerCase();
        return tokens.some(tok => lower.includes(tok));
      });
      // If no matching tokens found, do not fallback to full list here (prevents showing all)
      this.holidayOptions = filtered.length > 0 ? filtered : [];
    } else {
      // No session token — show full list
      this.holidayOptions = [...raw];
    }
  }

  // Managers = [
  //   {label:'X', value:'x'},
  //   {label:'Y', value:'Y'},
  //   {label:'Z', value:'Z'}

  // ]

  ngOnInit() {
    // Handle direct navigation or refresh
    this.loadPageState();

    // Listen for navigation events (e.g., clicking sidebar again)
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadPageState();
      });
      // Pre-fill holiday from session if provided and lock selection
      const sessionHoliday = sessionStorage.getItem('holiday');
      if (sessionHoliday && sessionHoliday.trim() !== '') {
        this.formData.holiday = sessionHoliday;
        this.holidayLocked = true;
      }

      // If CompanyId exists in session we fetch company details first so the holiday fetch
      // can use the resolved companyName for filtering; otherwise fetch holidays directly.
      const sessionCompanyIdStr = sessionStorage.getItem('CompanyId');
      const sessionCompanyId = sessionCompanyIdStr ? Number(sessionCompanyIdStr) : NaN;
      if (!isNaN(sessionCompanyId)) {
        this.fetchCompanyDetails();
      } else {
        // No company context → load holidays normally (no company filtering)
        this.fetchHolidayOptions();
      }
      // Also load available departments / designations / roles right when page opens
      this.fetchAllDepartments();
      this.fetchAllDesignations();
      this.fetchAllRoles();
  }

  // Fetch company metadata using session-stored CompanyId (if available)
  private fetchCompanyDetails() {
    const companyIdStr = sessionStorage.getItem('CompanyId');
    const companyId = companyIdStr ? Number(companyIdStr) : NaN;
    if (isNaN(companyId)) return;

    this.apiService.getCompanyById(companyId).subscribe({
      next: (res: any) => {
        // API may return the object directly or wrap it. Handle common variants
        const payload = res && (res.data ?? res) ? (res.data ?? res) : res;
        this.companyDetails = {
          companyId: payload.companyId ?? payload.companyID ?? payload.companyId ?? companyId,
          companyName: payload.companyName ?? payload.name ?? this.sessionCompany ?? '',
          startDate: payload.startDate ? this.formatDateForInput(payload.startDate) : payload.startDate ?? '',
          endDate: payload.endDate ? this.formatDateForInput(payload.endDate) : payload.endDate ?? ''
        };

        // Always set the form's companyName to the API-provided value when present
        if (this.companyDetails && this.companyDetails.companyName) {
          this.formData.companyName = this.companyDetails.companyName;
          // update sessionCompany so the input remains disabled and consistent with API
          this.sessionCompany = String(this.companyDetails.companyName);
        }
        // populate the numeric id on the form as well
        if (this.companyDetails && (this.companyDetails.companyId !== undefined && this.companyDetails.companyId !== null)) {
          const id = Number(this.companyDetails.companyId);
          if (!isNaN(id)) this.formData.companyId = id;
        }
          // also try to populate department/designation/role from session ids if available
          this.fetchAndApplyNamesFromSession();

          // We now have a resolved sessionCompany (from API). If holidays were already fetched
          // earlier, re-apply the filtering; otherwise fetch using the resolved company value.
          if (this.holidayAllOptions && this.holidayAllOptions.length) {
            this.applyHolidayFilter();
          } else {
            this.fetchHolidayOptions(true);
          }
      },
      error: (err: any) => {
        console.error('Failed to load company details:', err);
        // silently ignore; companyDetails remains null
      }
    });
  }

  // On create page open: fetch department/designation/role names using IDs persisted in sessionStorage
  private fetchAndApplyNamesFromSession() {
    // department
    const deptIdStr = sessionStorage.getItem('departmentId');
    const desigIdStr = sessionStorage.getItem('designationId');
    const roleIdStr = sessionStorage.getItem('roleId');

    const deptId = deptIdStr ? Number(deptIdStr) : NaN;
    const desigId = desigIdStr ? Number(desigIdStr) : NaN;
    const rId = roleIdStr ? Number(roleIdStr) : NaN;
    const sessionCompanyIdStr = sessionStorage.getItem('CompanyId');
    const sessionCompanyId = sessionCompanyIdStr ? Number(sessionCompanyIdStr) : NaN;

    if (!isNaN(deptId)) {
      this.apiService.getDepartmentName(deptId).subscribe({
        next: (res: any) => {
          const name = res?.departmentName ?? res?.name ?? (typeof res === 'string' ? res : null);
          this.resolvedDepartmentName = name || null;
          if (name && !this.formData.department) this.formData.department = name;
          // preserve the ID as well so save payload can include departmentId
          if (!isNaN(deptId)) this.formData.departmentId = deptId;
        },
        error: (err) => { /* silently ignore */ }
      });
    }

    if (!isNaN(desigId)) {
      this.apiService.getDesignationName(desigId).subscribe({
        next: (res: any) => {
          const name = res?.designationName ?? res?.name ?? (typeof res === 'string' ? res : null);
          this.resolvedDesignationName = name || null;
          if (name && !this.formData.designation) this.formData.designation = name;
          // preserve the ID as well so save payload can include designationId
          if (!isNaN(desigId)) this.formData.designationId = desigId;
        },
        error: () => { /* ignore */ }
      });
    }

    if (!isNaN(rId)) {
      this.apiService.getRoleName(rId).subscribe({
        next: (res: any) => {
          const name = res?.roleName ?? res?.name ?? (typeof res === 'string' ? res : null);
          this.resolvedRoleName = name || null;
          // Set the name and prefer storing the ID in formData.roleId so we can use IDs when saving
          if (name && !this.formData.role) this.formData.role = name;
          if (!isNaN(rId)) this.formData.roleId = rId;
        },
        error: () => { /* ignore */ }
      });

      // If CompanyId exists in session, keep it on the form for submission
      if (!isNaN(sessionCompanyId)) {
        this.formData.companyId = sessionCompanyId;
      }
    }
  }

  // Fetch the full list of departments to show as a hint on the form
  private fetchAllDepartments() {
    this.apiService.getAllDepartments().subscribe({
      next: (res: any) => {
        // Normalize result to an array of names
        if (!res) return;
        let items: any[] = [];
        if (Array.isArray(res)) items = res;
        else if (Array.isArray(res?.data)) items = res.data;

        this.departmentsList = items
          .map(i => ({
            departmentId: Number(i.departmentId ?? i.id ?? i.deptId ?? NaN),
            departmentName: String(i.departmentName ?? i.name ?? i?.deptName ?? i).trim()
          }))
          .filter(d => !!d.departmentName);
      },
      error: (err) => {
        console.error('Failed to load departments list:', err);
        // silently continue — the feature is only a hint
      }
    });
  }

  // Fetch all designations - used only for hint display (non-blocking)
  private fetchAllDesignations() {
    this.apiService.getAllDesignations().subscribe({
      next: (res: any) => {
        if (!res) return;
        let items: any[] = [];
        if (Array.isArray(res)) items = res;
        else if (Array.isArray(res?.data)) items = res.data;

        // Keep a master list including departmentId (if backend provides it) so we can
        // filter designations by department when the user chooses one.
        this.allDesignations = items
          .map(i => ({
            designationId: Number(i.designationId ?? i.id ?? i.desigId ?? NaN),
            designationName: String(i.designationName ?? i.name ?? i?.title ?? i).trim(),
            departmentId: Number(i.departmentId ?? i.deptId ?? i.joineeDepartmentId ?? NaN) || undefined
          }))
          .filter(d => !!d.designationName);

        // Initialize visible list
        this.designationsList = [...this.allDesignations];
      },
      error: (err) => {
        console.error('Failed to load designations list:', err);
      }
    });
  }

  // Fetch all roles to show as hints (if backend returns role names)
  private fetchAllRoles() {
    this.apiService.getAllRoles().subscribe({
      next: (res: any) => {
        if (!res) return;
        let items: any[] = [];
        if (Array.isArray(res)) items = res;
        else if (Array.isArray(res?.data)) items = res.data;

        this.rolesList = items
          .map(i => ({
            roleId: Number(i.roleId ?? i.id ?? i.roleId ?? NaN),
            roleName: String(i.roleName ?? i.name ?? i?.title ?? i).trim()
          }))
          .filter(r => !!r.roleName);
      },
      error: (err) => {
        console.error('Failed to load roles list:', err);
      }
    });
  }

  // Small helper getters used by the template (avoid complex expressions in templates)
  get departmentsPreview(): string {
    if (!this.departmentsList || this.departmentsList.length === 0) return '';
    const preview = this.departmentsList.slice(0, 6).map(d => d.departmentName).join(', ');
    return preview + (this.departmentsList.length > 6 ? ', ...' : '');
  }

  get designationsPreview(): string {
    if (!this.designationsList || this.designationsList.length === 0) return '';
    const preview = this.designationsList.slice(0, 6).map(d => d.designationName).join(', ');
    return preview + (this.designationsList.length > 6 ? ', ...' : '');
  }

  get rolesPreview(): string {
    if (!this.rolesList || this.rolesList.length === 0) return '';
    const preview = this.rolesList.slice(0, 6).map(r => r.roleName).join(', ');
    return preview + (this.rolesList.length > 6 ? ', ...' : '');
  }

  // When user selects a role from the select box, keep the display name in formData.role
  // while also storing the corresponding roleId in formData.roleId (if available)
  onRoleSelected(selectedRoleIdOrName: any) {
    const id = Number(selectedRoleIdOrName);
    if (!isNaN(id)) {
      // Selected value is an ID
      this.formData.roleId = id;
      const match = this.rolesList.find(r => r.roleId === id);
      this.formData.role = match ? match.roleName : '';
      this.resolvedRoleName = this.formData.role || this.resolvedRoleName;
    } else {
      // Fallback case (legacy string options)
      const chosenName = String(selectedRoleIdOrName ?? '').trim();
      this.formData.role = chosenName;
      this.formData.roleId = undefined as any;
      this.resolvedRoleName = chosenName || this.resolvedRoleName;
    }
  }

  onDepartmentSelected(selectedDepartmentIdOrName: any) {
    const id = Number(selectedDepartmentIdOrName);
    if (!isNaN(id)) {
      this.formData.departmentId = id;
      const match = this.departmentsList.find(d => d.departmentId === id);
      this.formData.department = match ? match.departmentName : '';
      this.resolvedDepartmentName = this.formData.department || this.resolvedDepartmentName;
    } else {
      const chosenName = String(selectedDepartmentIdOrName ?? '').trim();
      this.formData.department = chosenName;
      // try to lookup its ID from known list
      const match = this.departmentsList.find(d => d.departmentName === chosenName);
      this.formData.departmentId = match ? match.departmentId : undefined;
      this.resolvedDepartmentName = this.formData.department || this.resolvedDepartmentName;
    }

    // After department selection, filter the designationsList to only those belonging to
    // the selected department (if designations have departmentId). If the backend doesn't
    // provide department associations for designations, we'll keep the full list.
    const deptIdForFilter = Number(this.formData.departmentId);
    if (!isNaN(deptIdForFilter) && this.allDesignations && this.allDesignations.length) {
      // If allDesignations have departmentId defined then filter; otherwise leave unchanged
      const hasDeptInfo = this.allDesignations.some(d => d.departmentId !== undefined);
      if (hasDeptInfo) {
        this.designationsList = this.allDesignations.filter(d => d.departmentId === deptIdForFilter);
      } else {
        this.designationsList = [...this.allDesignations];
      }

      // If the previously selected designation doesn't belong to the new department, clear it
      if (this.formData.designationId && !this.designationsList.find(d => d.designationId === Number(this.formData.designationId))) {
        this.formData.designationId = undefined as any;
        this.formData.designation = '';
      }
    } else {
      // No numeric department id selected; show full list
      this.designationsList = [...this.allDesignations];
    }
  }

  onDesignationSelected(selectedDesignationIdOrName: any) {
    const id = Number(selectedDesignationIdOrName);
    if (!isNaN(id)) {
      this.formData.designationId = id;
      const match = this.designationsList.find(d => d.designationId === id);
      this.formData.designation = match ? match.designationName : '';
      this.resolvedDesignationName = this.formData.designation || this.resolvedDesignationName;
    } else {
      const chosenName = String(selectedDesignationIdOrName ?? '').trim();
      this.formData.designation = chosenName;
      const match = this.designationsList.find(d => d.designationName === chosenName);
      this.formData.designationId = match ? match.designationId : undefined;
      this.resolvedDesignationName = this.formData.designation || this.resolvedDesignationName;
    }
  }


  private loadPageState() {
    const navState = history.state as {
      employeeData?: any;
      viewMode?: boolean;
      editMode?: boolean;
    };

    if (navState && (navState.viewMode || navState.editMode)) {
      const employeeData = { ...navState.employeeData };

      if (employeeData.dateOfBirth || employeeData.joiningDate) {
        employeeData.dateOfBirth = this.formatDateForInput(employeeData.dateOfBirth);
        employeeData.joiningDate = this.formatDateForInput(employeeData.joiningDate);
      }

      this.formData = {
        ...employeeData,
        timesheet: employeeData.timesheet || employeeData.timeSheet || '',
        companyId: Number(employeeData.companyId ?? sessionStorage.getItem('CompanyId') ?? NaN)
      };

      this.originalData = { ...this.formData };
      this.isViewMode = navState.viewMode || false;
      this.isEditMode = navState.editMode || false;
    } else {
      // No state passed → means fresh create from sidebar
      this.resetFormData();
      this.isViewMode = false;
      this.isEditMode = false;
    }
  }

  private resetFormData() {
    this.formData = {
      empId: '',
      managerId: '',
      isManagerAssigned: false,
      firstName: '',
      middleName: '',
      lastName: '',
      userName: '',
      dateOfBirth: '',
      mobileNumber: '',
      gender: '',
      address: '',
      email: '',
      department: '',
      departmentId: undefined,
      role: '',
      roleId: NaN,
      password: '',
      joiningDate: '',
      reportingManager: '',
      designation: '',
      designationId: undefined,
      companyName: this.sessionCompany,
      companyId: sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : NaN,
      holiday: sessionStorage.getItem('holiday') ?? '',
      timesheet: ''
    };
    this.originalData = null;
  }

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { employeeData: any, viewMode: boolean, editMode: boolean };

    // Get logged-in user's role from sessionStorage (adjust key as needed)
    const userRole = sessionStorage.getItem('userRole');
    if (userRole) {
      if (userRole.startsWith('{')) {
        try {
          const user = JSON.parse(userRole);
          this.loggedInRole = user.role ? user.role.toLowerCase() : '';
        } catch (e) {
          this.loggedInRole = '';
        }
      } else {
        this.loggedInRole = userRole.toLowerCase();
      }
    }

    if (state?.employeeData) {
      // Create a copy of the employee data
      const employeeData = { ...state.employeeData };
      // Format the date if it exists
      if (employeeData.dateOfBirth || employeeData.joiningDate) {
        employeeData.dateOfBirth = this.formatDateForInput(employeeData.dateOfBirth);
        employeeData.joiningDate = this.formatDateForInput(employeeData.joiningDate);
      }
      // Assign the formatted data to formData
      // Ensure timeSheet is present in formData
      this.formData = {
        ...employeeData,
        timesheet: employeeData.timesheet || employeeData.timeSheet || '',
        companyId: Number(employeeData.companyId ?? sessionStorage.getItem('CompanyId') ?? NaN),
        departmentId: Number(employeeData.departmentId ?? NaN),
        designationId: Number(employeeData.designationId ?? NaN),
        roleId: Number(employeeData.roleId ?? NaN)
      };
      this.originalData = { ...employeeData, timesheet: employeeData.timesheet || employeeData.timeSheet || '' };
      this.isViewMode = state.viewMode || false;
      this.isEditMode = state.editMode || false;
    } else {
      // Navigated without state (e.g., via Create Employee dropdown): reset to create mode
      this.isViewMode = false;
      this.isEditMode = false;
      this.formData = {
        empId: '',
        managerId: '',
        isManagerAssigned: false,
        firstName: '',
        middleName: '',
        lastName: '',
        userName: '',
        dateOfBirth: '',
        mobileNumber: '',
        gender: '',
        address: '',
        email: '',
        department: '',
        role: '',
        roleId: undefined,
        departmentId: undefined,
        designationId: undefined,
        password: '',
        joiningDate: '',
        reportingManager: '',
        designation: '',
        companyName: this.sessionCompany,
        companyId: sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : NaN,
        holiday: '',
        timesheet: ''
      };
      this.originalData = null;
    }

    this.loadManagers();
  }

  // Add this method to fetch and filter managers
  private loadManagers() {
    // Prefer company-scoped users when CompanyId is available in sessionStorage
    const companyIdStr = sessionStorage.getItem('CompanyId');
    const companyIdNum = companyIdStr ? Number(companyIdStr) : NaN;

    const handleUsers = (users: User[]) => {
      // Filter users with role 'Manager' or 'Admin' (case-insensitive)
      this.managers = users.filter(user =>
        !!user.role && (user.role.toLowerCase() === 'manager' || user.role.toLowerCase() === 'admin')
      );

      // If editing and has a reporting manager, ensure it's in the list
      if (this.formData.reportingManager) {
        const currentManagerExists = this.managers.some(
          m => m.empId === this.formData.reportingManager
        );

        if (!currentManagerExists) {
          // Try to find the manager in the provided users list first
          const missingManager = users.find(u => u.empId === this.formData.reportingManager);
          if (missingManager) {
            this.managers.push(missingManager);
            return;
          }

          // As a fallback, fetch all users and try to locate the missing manager
          this.apiService.getAllUsers().subscribe({
            next: (allUsers: User[]) => {
              const found = allUsers.find(u => u.empId === this.formData.reportingManager);
              if (found) {
                this.managers.push(found);
              }
            },
            error: () => {
              // silent fallback; manager simply won't appear if not found
            }
          });
        }
      }
    };

    if (!isNaN(companyIdNum)) {
      this.apiService.getUsersByCompany(companyIdNum).subscribe({
        next: (companyUsers: User[]) => {
          handleUsers(companyUsers);
        },
        error: (err) => {
          console.error('Failed to load company users:', err);
          // Fallback to fetching all users
          this.apiService.getAllUsers().subscribe({
            next: (users: User[]) => handleUsers(users),
            error: (e) => {
              console.error('Failed to load users as fallback:', e);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load managers list',
                life: 3000
              });
            }
          });
        }
      });
    } else {
      // No company id, fetch all users
      this.apiService.getAllUsers().subscribe({
        next: (users: User[]) => handleUsers(users),
        error: (err) => {
          console.error('Failed to load managers:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load managers list',
            life: 3000
          });
        }
      });
    }
  }

  // Helper function to convert date to yyyy-MM-dd format
 private formatDateForInput(dateString: string): string {
  if (!dateString) return '';

  // Case 1: Already in yyyy-MM-dd (safe for <input type="date">)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Case 2: Backend sends DD/MM/YYYY → convert to YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    const [dd, mm, yyyy] = dateString.split('/');
    return `${yyyy}-${mm}-${dd}`; 
  }

  // Case 3: If backend sends ISO string
  const d = new Date(dateString);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return '';
}

  isAdminRole(): boolean {
    return !!this.formData.role && this.formData.role.toLowerCase() === 'admin';
  }

  // updateEmployee() {

  //   if (!this.isEditMode) {
  //     this.apiService.getAllUsers().subscribe({
  //       next: (users: User[]) => {
  //         const empIdExists = users.some(u => u.empId === this.formData.empId);
  //         if (empIdExists) {
  //           this.messageService.add({
  //             severity: 'error',
  //             summary: 'Error',
  //             detail: 'This Employee ID is already used. Please use another.',
  //             life: 4000
  //           });
  //           return;
  //         }
  //         const userNameExists = users.some(u => u.userName === this.formData.userName);
  //         console.log(userNameExists);

  //         if (userNameExists) {
  //           this.messageService.add({
  //             severity: 'error',
  //             summary: 'Error',
  //             detail: 'This Username is already used. Please use another.',
  //             life: 4000
  //           });
  //           return;
  //         }
  //         const emailExists = users.some(u => u.email === this.formData.email);
  //         if (emailExists) {
  //           this.messageService.add({
  //             severity: 'error',
  //             summary: 'Error',
  //             detail: 'This Email is already used. Please use another.',
  //             life: 4000
  //           });
  //           return;
  //         }
  //         this.saveEmployee();
  //       },
  //       error: (err) => {
  //         this.messageService.add({
  //           severity: 'error',
  //           summary: 'Error',
  //           detail: 'Failed to check uniqueness.',
  //           life: 4000
  //         });
  //       }
  //     });
  //   } else {
  //     this.saveEmployee();
  //   }
  // }

  updateEmployee() {
    // Validate all mandatory fields first
    if (!this.validateFormData()) {
      return;
    }
    const companyIdStr = sessionStorage.getItem('CompanyId');
    const companyIdNum = companyIdStr ? Number(companyIdStr) : NaN;
    // Check for duplicates only when creating new employee (not when editing)
    if (!this.isEditMode) {
     this.apiService.getUsersByCompany(companyIdNum).subscribe({
        next: (users: User[]) => {
          const empIdExists = users.some(u => u.empId === this.formData.empId);
          if (empIdExists) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'This Employee ID is already used. Please use another.',
              life: 4000
            });
            return;
          }
          const userNameExists = users.some(u => u.userName === this.formData.userName);
          console.log(userNameExists);

          if (userNameExists) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'This Username is already used. Please use another.',
              life: 4000
            });
            return;
          }
          const emailExists = users.some(u => u.email === this.formData.email);
          if (emailExists) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'This Email is already used. Please use another.',
              life: 4000
            });
            return;
          }
          this.saveEmployee();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to check uniqueness.',
            life: 4000
          });
        }
      });
    } else {
      this.saveEmployee();
    }
  }

  // Helper to save employee after validation
  // private saveEmployee() {
  //   if (this.formData.reportingManager) {
  //     this.formData.managerId = this.formData.reportingManager;
  //   } else {
  //     this.formData.managerId = '';
  //   }
  //   this.formData.isManagerAssigned = !!this.formData.managerId;

  //   this.apiService.saveUser(this.formData).subscribe({
  //     next: (res) => {
  //       if (this.isEditMode) {
  //         this.showToastSuccess('Employee details updated successfully', 5000);
  //         setTimeout(() => {
  //           this.router.navigate(['/employee-list']);
  //         }, 5000);
  //       } else {
  //         this.showToastSuccess('Employee details created successfully', 1500);
  //         setTimeout(() => {
  //           this.router.navigate(['/employee-list']);
  //         }, 1500);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error:', err);
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail: this.isEditMode ? 'Failed to update employee details' : 'Failed to create employee details',
  //         life: 5000
  //       });
  //     }
  //   });
  //   console.log(this.formData);
  // }

  private saveEmployee() {
  // Map selected reporting manager to managerId
  if (this.formData.reportingManager) {
    this.formData.managerId = this.formData.reportingManager;
  } else {
    this.formData.managerId = '';
  }

  // Now submit this.formData to backend


    // Set isManagerAssigned to true if managerId is present
    this.formData.isManagerAssigned = !!this.formData.managerId;

    // Build save payload that includes only departmentId/designationId/roleId (no names)
    const payload: any = { ...this.formData };

    // Normalize managerId — reportingManager has already been mapped to managerId earlier
    payload.managerId = payload.managerId || '';

    // For each of department/designation/role: convert NaN -> null and remove the name fields
    const deptId = Number(this.formData.departmentId);
    payload.departmentId = !isNaN(deptId) ? deptId : null;
    delete payload.department; // do not send department name

    const desigId = Number(this.formData.designationId);
    payload.designationId = !isNaN(desigId) ? desigId : null;
    delete payload.designation; // do not send designation name

    const rId = Number(this.formData.roleId);
    payload.roleId = !isNaN(rId) ? rId : null;
    delete payload.role; // do not send role name

    // Remove any resolvedName fields used only for UI hints
    delete payload.resolvedDepartmentName;
    delete payload.resolvedDesignationName;
    delete payload.resolvedRoleName;

    // Company: send only companyId (no companyName)
    const cId = Number(this.formData.companyId);
    payload.companyId = !isNaN(cId) ? cId : null;
    delete payload.companyName;

    this.apiService.saveUser(payload).subscribe({
      next: (res) => {
        if (this.isEditMode) {
          this.showToastSuccess('Employee details updated successfully', 5000);
          setTimeout(() => {
            this.router.navigate(['/employee-list']);
          }, 5000);
        } else {
          this.showToastSuccess('Employee details created successfully', 1500);
          setTimeout(() => {
            this.router.navigate(['/employee-list']);
          }, 1500);
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.isEditMode ? 'Failed to update employee details' : 'Failed to create employee details',
          life: 5000
        });
      }
    });
    console.log(this.formData);
  }

  OnCancel() {
   // this.router.navigate(['/employee-list']);
  }

// OnReset(form?: any) {
//   if (this.isEditMode) {
//     this.formData = { ...this.originalData };
//   } else {
//     const empId = this.formData.empId;
//     this.formData = {
//       empId:'',
//       managerId: '',
//       isManagerAssigned: false,
//       firstName: '',
//       middleName: '',
//       lastName: '',
//       userName: '',
//       dateOfBirth: '',
//       mobileNumber: '',
//       gender: '',
//       address: '',
//       email: '',
//       department: '',
//       role: '',
//       password: '',
//       joiningDate: '',
//       reportingManager: '',
//       designation: '',
//       companyName: '',
//       holiday: '',
//       timesheet: ''
//     };
//    }
//   }

OnReset(form?: any) {
  const sessionHoliday = sessionStorage.getItem('holiday');
  const holidayVal = sessionHoliday && sessionHoliday.trim() !== '' ? sessionHoliday : '';

  if (this.isEditMode) {
    this.formData = { ...this.originalData };
    const empId = this.formData.empId;
    this.formData = {
      empId, // Edit mode employee ID not editeble
      managerId: '',
      isManagerAssigned: false,
      firstName: '',
      middleName: '',
      lastName: '',
      userName: '',
      dateOfBirth: '',
      mobileNumber: '',
      gender: '',
      address: '',
      email: '',
      department: '',
      departmentId: undefined,
      role: '',
      roleId: undefined,
      password: '',
      joiningDate: '',
      reportingManager: '',
      designation: '',
      designationId: undefined,
  companyName: this.sessionCompany || this.formData.companyName,
  companyId: this.formData.companyId ?? (sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : NaN),
      holiday: holidayVal,
      timesheet: ''
    };

    if (form) {
      form.resetForm({ ...this.formData });
    }
  } 
  else {
    // Create Mode Clear everything inpute box
    this.formData = {
      empId: '',
      managerId: '',
      isManagerAssigned: false,
      firstName: '',
      middleName: '',
      lastName: '',
      userName: '',
      dateOfBirth: '',
      mobileNumber: '',
      gender: '',
      address: '',
      email: '',
      department: '',
      departmentId: undefined,
      designationId: undefined,
      role: '',
      roleId: undefined,
      password: '',
      joiningDate: '',
      reportingManager: '',
      designation: '',
      companyName: this.sessionCompany,
      companyId: sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : NaN,
      holiday: holidayVal,
      timesheet: ''
    };

    if (form) {
      form.resetForm({ ...this.formData });
    }

    //  Clear dropdowns value 
    this.formData.gender = '';
    this.formData.role = '';
    this.formData.reportingManager = '';
    this.formData.holiday = '';
    this.formData.timesheet = '';
  }
}



  private validateFormData(): boolean {
    // List of mandatory fields
    const requiredFields = [
      'empId', 'firstName', 'lastName', 'userName', 'email',
      'password', 'gender', 'mobileNumber', 'dateOfBirth',
      'department', 'role', 'designation', 'joiningDate'
    ];

    const missingFields: string[] = [];

    // Check each mandatory field
    requiredFields.forEach(field => {
      // Special-case fields that can be identified by ID instead of name
      if (field === 'department') {
        const id = Number(this.formData.departmentId);
        if (isNaN(id) && (!this.formData.department || String(this.formData.department).trim() === '')) {
          missingFields.push('Department');
        }
        return;
      }
      if (field === 'designation') {
        const id = Number(this.formData.designationId);
        if (isNaN(id) && (!this.formData.designation || String(this.formData.designation).trim() === '')) {
          missingFields.push('Designation');
        }
        return;
      }
      if (field === 'role') {
        const id = Number(this.formData.roleId);
        if (isNaN(id) && (!this.formData.role || String(this.formData.role).trim() === '')) {
          missingFields.push('Role');
        }
        return;
      }

      const value = this.formData[field as keyof typeof this.formData];
      if (!value || value.toString().trim() === '') {
        // Convert field name to readable format (e.g., 'firstName' becomes 'First Name')
        const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        missingFields.push(fieldName);
      }
    });

    // Show error if any mandatory fields are missing
    if (missingFields.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Please fill all mandatory fields: ${missingFields.join(', ')}`,
        life: 5000
      });
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a valid email address',
        life: 4000
      });
      return false;
    }

    // Validate mobile number (should be exactly 10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(this.formData.mobileNumber)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Mobile number must be exactly 10 digits',
        life: 4000
      });
      return false;
    }

    // Validate date of birth (cannot be in future)
    if (this.isFutureDate(this.formData.dateOfBirth)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Date of Birth cannot be in the future',
        life: 4000
      });
      return false;
    }
 if (this.formData.role && this.formData.role !== 'Admin') {
  const value = this.formData.reportingManager;

  if (!value || value.toString().trim() === '') {
   
    this.messageService.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Reporting Manager is required.',
      life: 4000
    });
    return false;
  }
}
    return true;
  }
}