import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import * as XLSX from 'xlsx';
import { environment } from '../../../environmentts/environment';
import { ApiService } from '../../../services/services';
// import { environment } from '../../../environmentts/environment'; 

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  loggedInRole: string = '';
  showToast(severity: string, summary: string, detail: string, options: any = {}) {
    this.messageService.add({ severity, summary, detail, ...options });
  }

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private router: Router,
    private apiService: ApiService
  ) { }
  searchText = '';
  filterRole = '';
  employees: any[] = [];
  // Cache maps to translate IDs -> names
  private departmentMap: Map<number, string> = new Map();
  private designationMap: Map<number, string> = new Map();
  private roleMap: Map<number, string> = new Map();
  // Map empId -> "First Last" for fast lookups of employee names (used for Reporting Manager display)
  private employeeNameMap: Map<string, string> = new Map();
  private companyCache: Map<number, string> = new Map();
  private baseUrl = environment.baseurl;
  // employees: any[] = [];
  isLoading: boolean = false;
  selectedEmployee: any = null;

  // Show/hide filter input for each column
  showFilter: { [key: string]: boolean } = {
    empId: false,
    joiningDate: false,
    firstName: false,
    middleName: false,
    lastName: false,
    userName: false,
    dateOfBirth: false,
    mobileNumber: false,
    gender: false,
    email: false,
    department: false,
    designation: false,
    companyName: false,
    address: false,
    holiday: false,
    reportingManager: false,
    role: false
  };

  // Filter value for each column
  columnFilters: { [key: string]: string } = {
    empId: '',
    joiningDate: '',
    firstName: '',
    middleName: '',
    lastName: '',
    userName: '',
    dateOfBirth: '',
    mobileNumber: '',
    gender: '',
    email: '',
    department: '',
    designation: '',
    companyName: '',
    address: '',
    holiday: '',
    reportingManager: '',
    role: ''
  };

  toggleFilter(column: string) {
    this.showFilter[column] = !this.showFilter[column];
    if (!this.showFilter[column]) {
      this.columnFilters[column] = '';
    }
  }
  ngOnInit(): void {
    // Load reference lists (departments/designations/roles) first, then fetch employees
    this.loadReferenceData();
    this.fetchEmployees();

    // Get logged-in user's role from sessionStorage (adjust key as needed)
    const userRole = sessionStorage.getItem('userRole');
    if (userRole) {
      // If stored as a string (e.g., 'Admin'), use directly
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

  }
  // ngOnInit(): void {
  //   this.fetchEmployees(); 
  // }

  // fetch api for get all emp 
  fetchEmployees() {
    this.isLoading = true;

    const companyIdStr = sessionStorage.getItem('CompanyId');
    const companyIdNum = companyIdStr ? Number(companyIdStr) : NaN;

    // If a valid numeric company id is present, call company-specific API
    if (!isNaN(companyIdNum)) {
      this.apiService.getUsersByCompany(companyIdNum).subscribe({
          next: (data: any) => {
            this.employees = Array.isArray(data) ? data : (data?.data ?? []);
            // Normalize and enrich records with readable names
            this.enrichEmployeesWithNames(this.employees);
            this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching employees by company:', err);
          this.showToast('error', 'Error', 'Failed to load employee data.');
          this.isLoading = false;
        }
      });
      return;
    }

    // Fallback: fetch all users when no valid company id
    this.apiService.getAllUsers().subscribe({
      next: (data: any) => {
        this.employees = Array.isArray(data) ? data : (data?.data ?? []);
        this.enrichEmployeesWithNames(this.employees);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        this.showToast('error', 'Error', 'Failed to load employee data.');
        this.isLoading = false;
      }
    });
  }


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
    // Format date as yyyy-MM-dd
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    const fileName = `Employee_Details_${formattedDate}.xlsx`;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  // Load reference lists once and populate maps for fast ID->name lookups
  private loadReferenceData() {
    // Departments
    this.apiService.getAllDepartments().subscribe({
      next: (res: any) => {
        const items = Array.isArray(res) ? res : (res?.data ?? []);
        items.forEach((i: any) => {
          const id = Number(i.departmentId ?? i.id ?? i.deptId ?? NaN);
          const name = String(i.departmentName ?? i.name ?? i.deptName ?? i).trim();
          if (!isNaN(id) && name) this.departmentMap.set(id, name);
        });
        // If employees already loaded, try to enrich
        if (this.employees && this.employees.length) this.enrichEmployeesWithNames(this.employees);
      },
      error: () => { /* ignore */ }
    });

    // Designations
    this.apiService.getAllDesignations().subscribe({
      next: (res: any) => {
        const items = Array.isArray(res) ? res : (res?.data ?? []);
        items.forEach((i: any) => {
          const id = Number(i.designationId ?? i.id ?? i.desigId ?? NaN);
          const name = String(i.designationName ?? i.name ?? i.title ?? i).trim();
          if (!isNaN(id) && name) this.designationMap.set(id, name);
        });
        if (this.employees && this.employees.length) this.enrichEmployeesWithNames(this.employees);
      },
      error: () => { /* ignore */ }
    });

    // Roles
    this.apiService.getAllRoles().subscribe({
      next: (res: any) => {
        const items = Array.isArray(res) ? res : (res?.data ?? []);
        items.forEach((i: any) => {
          const id = Number(i.roleId ?? i.id ?? NaN);
          const name = String(i.roleName ?? i.name ?? i.title ?? i).trim();
          if (!isNaN(id) && name) this.roleMap.set(id, name);
        });
        if (this.employees && this.employees.length) this.enrichEmployeesWithNames(this.employees);
      },
      error: () => { /* ignore */ }
    });
  }

  // Enrich employee array by replacing ID values with names where possible.
  // This is defensive: works whether the API returns names or IDs.
  private enrichEmployeesWithNames(employees: any[]) {
    if (!Array.isArray(employees)) return;

    // build a quick map of empId -> full name so we can resolve reportingManager ids to names
    employees.forEach(emp => {
      const id = (emp.empId ?? emp.id ?? '').toString();
      const first = String(emp.firstName ?? '').trim();
      const last = String(emp.lastName ?? '').trim();
      const full = `${first} ${last}`.trim();
      if (id) this.employeeNameMap.set(id, full || id);
    });

    // Collect companyIds we need to resolve
    const missingCompanyIds = new Set<number>();

    employees.forEach(emp => {
      // Normalize department -> if departmentId exists, prefer it, otherwise try parse department field
      let deptId: number | undefined;
      if (emp.departmentId !== undefined && emp.departmentId !== null && emp.departmentId !== '') {
        const v = Number(emp.departmentId);
        if (!isNaN(v)) deptId = v;
      } else if (emp.department && /^\d+$/.test(String(emp.department))) {
        const v = Number(emp.department);
        if (!isNaN(v)) deptId = v;
      }

      if (deptId !== undefined) {
        const name = this.departmentMap.get(deptId);
        if (name) {
          emp.department = name;
        } else {
          // fallback: fetch single department name
          this.apiService.getDepartmentName(deptId).subscribe({
            next: (res: any) => {
              const deptName = res?.departmentName ?? res?.name ?? String(res ?? '').trim();
              if (deptName) {
                this.departmentMap.set(deptId as number, deptName);
                emp.department = deptName;
              }
            },
            error: () => { /* ignore */ }
          });
        }
      }

      // Designation
      let desigId: number | undefined;
      if (emp.designationId !== undefined && emp.designationId !== null && emp.designationId !== '') {
        const v = Number(emp.designationId);
        if (!isNaN(v)) desigId = v;
      } else if (emp.designation && /^\d+$/.test(String(emp.designation))) {
        const v = Number(emp.designation);
        if (!isNaN(v)) desigId = v;
      }
      if (desigId !== undefined) {
        const name = this.designationMap.get(desigId);
        if (name) emp.designation = name;
        else {
          this.apiService.getDesignationName(desigId).subscribe({
            next: (res: any) => {
              const dName = res?.designationName ?? res?.name ?? String(res ?? '').trim();
              if (dName) {
                this.designationMap.set(desigId as number, dName);
                emp.designation = dName;
              }
            },
            error: () => { /* ignore */ }
          });
        }
      }

      // Role
      let roleId: number | undefined;
      if (emp.roleId !== undefined && emp.roleId !== null && emp.roleId !== '') {
        const v = Number(emp.roleId);
        if (!isNaN(v)) roleId = v;
      } else if (emp.role && /^\d+$/.test(String(emp.role))) {
        const v = Number(emp.role);
        if (!isNaN(v)) roleId = v;
      }
      if (roleId !== undefined) {
        const name = this.roleMap.get(roleId);
        if (name) emp.role = name;
        else {
          this.apiService.getRoleName(roleId).subscribe({
            next: (res: any) => {
              const rName = res?.roleName ?? res?.name ?? String(res ?? '').trim();
              if (rName) {
                this.roleMap.set(roleId as number, rName);
                emp.role = rName;
              }
            },
            error: () => { /* ignore */ }
          });
        }
      }

      // Reporting Manager: if manager stored as an ID, replace with "ID - First Last" when known
      // (this helps show the manager name instead of just a numeric id)
      if (emp.reportingManager !== undefined && emp.reportingManager !== null && emp.reportingManager !== '') {
        let rmVal = String(emp.reportingManager).trim();

        // Case: value may already be in the "ID - Name" format (from previous logic). If so,
        // extract the name portion and use only the name. Example: "EMP184 - Sanket Kumar" -> "Sanket Kumar"
        if (rmVal.includes(' - ')) {
          const parts = rmVal.split(' - ');
          // take everything after the first ' - '
          rmVal = parts.slice(1).join(' - ').trim();
          emp.reportingManager = rmVal || emp.reportingManager; // use extracted name if any
        } else if (this.employeeNameMap.has(rmVal)) {
          // Known empId in our cache: resolve to name
          emp.reportingManager = this.employeeNameMap.get(rmVal);
        } else if (rmVal) {
          // No cached name and rmVal isn't in 'ID - Name' format — try fetching by id.
          // Emp IDs in this app are alphanumeric (e.g. 'EMP142'), so be permissive and attempt the lookup.
          this.apiService.getUserById(rmVal).subscribe({
            next: (res: any) => {
              const payload = res && (res.data ?? res) ? (res.data ?? res) : res;
              const first = String(payload?.firstName ?? payload?.first ?? '').trim();
              const last = String(payload?.lastName ?? payload?.last ?? '').trim();
              const full = `${first} ${last}`.trim();
              if (full) {
                this.employeeNameMap.set(rmVal, full);
                // Update the employee entry (if it still references this id)
                emp.reportingManager = full;
              }
            },
            error: () => { /* ignore - keep id if fetch fails */ }
          });
        } else {
          // Already a plain name string, keep as-is
          emp.reportingManager = rmVal;
        }
      }

      // Company: if companyId present, cache for later resolution
      let cId: number | undefined;
      if (emp.companyId !== undefined && emp.companyId !== null && emp.companyId !== '') {
        const v = Number(emp.companyId);
        if (!isNaN(v)) cId = v;
      } else if (emp.companyName && /^\d+$/.test(String(emp.companyName))) {
        const v = Number(emp.companyName);
        if (!isNaN(v)) cId = v;
      }
      if (cId !== undefined) {
        if (this.companyCache.has(cId)) {
          emp.companyName = this.companyCache.get(cId);
        } else {
          missingCompanyIds.add(cId);
        }
      }

      // If employee already has a string name for department/designation/role/companyName, keep as-is
    });

    // Resolve missing company names in bulk (sequential calls) and update employees
    if (missingCompanyIds.size > 0) {
      missingCompanyIds.forEach((id) => {
        this.apiService.getCompanyById(id).subscribe({
          next: (res: any) => {
            const payload = res && (res.data ?? res) ? (res.data ?? res) : res;
            const name = payload?.companyName ?? payload?.name ?? String(payload ?? '').trim();
            if (name) {
              this.companyCache.set(id, name);
              // apply to all employees with this id
              this.employees.forEach(e => {
                if ((e.companyId !== undefined && Number(e.companyId) === id) || (e.companyName === String(id))) {
                  e.companyName = name;
                }
              });
            }
          },
          error: () => { /* ignore */ }
        });
      });
    }
  }

    getAllUsers() {
    this.http.get(`${this.baseUrl}${environment.GetAllUsers}`).subscribe({
      next: (data: any) => {
        console.log('API Response:', data); // ✅ Now you see actual response
        this.employees = data;              // Optional: store in employees
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }
  CreatePage() {
    this.router.navigate(['/create-page']);
  }

  // ViewPage() {
  //   if (!this.selectedEmployee) {
  //     this.showToast('warn', 'Warning', 'Please select an employee first');
  //     return;
  //   }

  //   this.router.navigate(['/create-page'], {
  //     state: {
  //       employeeData: this.selectedEmployee,
  //       viewMode: true
  //     }
  //   });
  // }

  // In EmployeeListComponent
ViewPage() {
  if (!this.selectedEmployee) {
    this.showToast('warn', 'Warning', 'Please select an employee first');
    return;
  }

  this.router.navigate(['/create-page'], {
    state: {
      employeeData: this.selectedEmployee,
      viewMode: true  // ← This is important!
    }
  });
}

  EditPage() {
    if (!this.selectedEmployee) {
      this.showToast('warn', 'Warning', 'Please select an employee first');
      return;
    }

    this.router.navigate(['/create-page'], {
      state: {
        employeeData: this.selectedEmployee,
        editMode: true
      }
    });
  }


  selectEmployee(employee: any) {
    this.selectedEmployee = employee;
  }



  // get filteredRecords() {
  //     return this.employees.filter(record => {
  //       // Global search (name or ID)
  //       const fullName = `${record.firstName || ''} ${record.middleName || ''} ${record.lastName || ''}`.toLowerCase();
  //       const searchMatch = !this.searchText ||
  //         fullName.includes(this.searchText.toLowerCase()) ||
  //         (record.empId && record.empId.toLowerCase().includes(this.searchText.toLowerCase()));

  //       // Role filter
  //       const roleMatch = !this.filterRole ||
  //         (record.role && record.role.toLowerCase() === this.filterRole.toLowerCase());

  //       // Column filters
  //       const columnMatch = Object.keys(this.columnFilters).every(key => {
  //         if (!this.columnFilters[key]) return true;
  //         const value = (record[key] || '').toString().toLowerCase();
  //         return value.includes(this.columnFilters[key].toLowerCase());
  //       });

  //       return searchMatch && roleMatch && columnMatch;
  //     });
  // }

  get filteredRecords() {
    return this.employees.filter(record => {
      // Global search (name or ID)
      const fullName = `${record.firstName || ''} ${record.middleName || ''} ${record.lastName || ''}`.toLowerCase();
      const searchMatch = !this.searchText ||
        fullName.includes(this.searchText.toLowerCase()) ||
        (record.empId && record.empId.toLowerCase().includes(this.searchText.toLowerCase()));

      // Role filter
      const roleMatch = !this.filterRole ||
        (record.role && record.role.toLowerCase() === this.filterRole.toLowerCase());

      // Column filters
      const columnMatch = Object.keys(this.columnFilters).every(key => {
        if (!this.columnFilters[key]) return true;

        const filterValue = this.columnFilters[key].toLowerCase().trim();
        const recordValue = (record[key] || '').toString().toLowerCase().trim();

        // Special case for gender - use exact match instead of contains
        if (key === 'gender') {
          return recordValue === filterValue;
        }

        // For other fields, use contains match (original behavior)
        return recordValue.includes(filterValue);
      });

      return searchMatch && roleMatch && columnMatch;
    });
  }

  private toLocalDateString(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}
