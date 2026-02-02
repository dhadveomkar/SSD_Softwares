import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/services';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit, AfterViewInit {
  echartsInstance: any;
  async ngAfterViewInit() {
    // Dynamically import ECharts only on the client
    const echarts = await import('echarts');
    this.echartsInstance = echarts.init(document.getElementById('orgChart'));
    this.renderOrgChart();
  }

  ngOnChanges() {
    this.renderOrgChart();
  }

  renderOrgChart() {
    if (!this.echartsInstance) return;
    let data = null;
    if (this.userData?.role?.toLowerCase() === 'admin' && this.adminOrgData) {
      data = this.convertAdminOrgDataToTree(this.adminOrgData);
    } else if (this.userData?.role?.toLowerCase() === 'manager' && this.managerOrgData) {
      data = this.convertManagerOrgDataToTree(this.managerOrgData);
    } else if (this.userData?.role?.toLowerCase() === 'user' && this.userOrgData) {
      data = this.convertUserOrgDataToTree(this.userOrgData);
      
    }
    if (!data) {
      this.echartsInstance.clear();
      return;
    }
    this.echartsInstance.setOption({
      tooltip: { trigger: 'item', triggerOn: 'mousemove' },
      series: [{
        type: 'tree',
        orient: 'vertical',
        data: [data],
        top: 50,
        left: '10%', // more horizontal space
        bottom: 50,
        right: '10%',
        symbol: 'rect',
        edgeShape: 'polyline',
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          borderRadius: 8,
          color: '#030303',
        },
        label: {
          position: 'inside',
          verticalAlign: 'middle',
          align: 'center',
          color: '#fff',
          backgroundColor: '#17408B',
          borderRadius: 8,
          padding: [8, 12],
          borderColor: '#fff',
          borderWidth: 2,
          rich: {
            name: {
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff',
              lineHeight: 18
            },
            designation: {
              fontSize: 11,
              color: '#ccc',
              lineHeight: 15
            }
          },
          formatter: function(params: any) {
            const [name, designation] = (params.name || '').split('\n');
            return '{name|' + name + '}\n{designation|' + (designation || '') + '}';
          }
        },
        leaves: {
          label: {
            position: 'inside',
            color: '#fff',
            backgroundColor: '#17408B',
            borderRadius: 8,
            padding: [8, 12],
            rich: {
              name: {
                fontSize: 14,
                fontWeight: 'bold',
                color: '#fff',
                lineHeight: 18
              },
              designation: {
                fontSize: 11,
                color: '#ccc',
                lineHeight: 15
              }
            },
            formatter: function(params: any) {
              const [name, designation] = (params.name || '').split('\n');
              return '{name|' + name + '}\n{designation|' + (designation || '') + '}';
            },
            width: 120 // fixed width for leaf labels
          },
          symbolSize: [120, 50] // wider leaf nodes for spacing
        },
        lineStyle: {
          color: '#fff',
          width: 2,
          curveness: 0,
          type: 'solid'
        },
        nodePadding: 30, // more vertical gap between nodes
        expandAndCollapse: true,
        animationDuration: 500,
        animationDurationUpdate: 300
      }],
      curveness: 0,
      backgroundColor: '#222'
    });
  }

  // Recursively convert userOrgData (with manager chain) to ECharts treeconvertUserOrgDataToTree(userOrgData: any): any {
  convertUserOrgDataToTree(userOrgData: any): any {
  if (Array.isArray(userOrgData.managers) && userOrgData.managers.length > 0) {
    // Start from the top-most manager
    let node: any = {
      name: `${userOrgData.managers[0].firstName} ${userOrgData.managers[0].lastName}\n${userOrgData.managers[0].designation}`,
      children: [] as any[]
    };
    let current = node;
    for (let i = 1; i < userOrgData.managers.length; i++) {
      const mgr = userOrgData.managers[i];
      const child: any = {
        name: `${mgr.firstName} ${mgr.lastName}\n${mgr.designation}`,
        children: [] as any[]
      };
      current.children = [child];
      current = child;
    }
    current.children = [{
      name: `${userOrgData.firstName} ${userOrgData.lastName}\n${userOrgData.designation}`,
      children: (userOrgData.employees || []).map((emp: any) => ({
        name: `${emp.firstName} ${emp.lastName}\n${emp.designation}`
      }))
    }];
    return node;
  } else {
    return {
      name: `${userOrgData.firstName} ${userOrgData.lastName}\n${userOrgData.designation}`,
      children: (userOrgData.employees || []).map((emp: any) => ({
        name: `${emp.firstName} ${emp.lastName}\n${emp.designation}`
      }))
    };
  }
}

  convertAdminOrgDataToTree(adminOrgData: any) {
    return {
      name: `${adminOrgData.firstName} ${adminOrgData.lastName}\n${adminOrgData.designation}`,
      children: (adminOrgData.managers || []).map((manager: any) => ({
        name: `${manager.firstName} ${manager.lastName}\n${manager.designation}`,
        children: (manager.employees || []).map((emp: any) => ({
          name: `${emp.firstName} ${emp.lastName}\n${emp.designation}`
        }))
      }))
    };
  }

  // Recursively build manager chain so top-most manager appears at the top
  convertManagerOrgDataToTree(managerOrgData: any): any {
    if (managerOrgData.manager) {
      // There is a manager above, so build the parent node
      return {
        name: `${managerOrgData.manager.firstName} ${managerOrgData.manager.lastName}\n${managerOrgData.manager.designation}`,
        children: [this.convertManagerOrgDataToTree({
          ...managerOrgData,
          manager: null // Prevent infinite loop
        })]
      };
    } else {
      // No more managers above, this is the current manager
      return {
        name: `${managerOrgData.firstName} ${managerOrgData.lastName}\n${managerOrgData.designation}`,
        children: (managerOrgData.employees || []).map((emp: any) => ({
          name: `${emp.firstName} ${emp.lastName}\n${emp.designation}`
        }))
      };
    }
  }
  // Optionally store the filtered users' names
  reportingUsers: { firstName: string; lastName: string }[] = []

  editMode: boolean = false;
  editFormData: any; // Store a copy of userData for editing
  // officeAddress: any;
  // userData: any;
  user = {
    name: 'Arati Pawar',
    role: 'Admin',
    avatar: 'assets/Images/avatar.png'
  };
  showDropdown = false;

  departmentsList: any[] = [];
  allDesignations: any[] = [];
  designationsList: any[] = [];


  

  constructor(
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.managerOrganization();
    this.userOrganization();
    this.loadOfficeAddress();
    this.loadUserData();
    this.getUsersReportingToMe();
    this.renderOrgChart();
    this.fetchAllDepartments();
    this.fetchAllDesignations();
  }

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

        // Match departmentId from session storage and set department name
        const deptId = sessionStorage.getItem('departmentId');
        if (deptId) {
          const dept = this.departmentsList.find(d => d.departmentId == Number(deptId));
          if (dept) {
            this.userData.department = dept.departmentName;
          }
        }
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

        // Match designationId from session storage and set designation name
        const desigId = sessionStorage.getItem('designationId');
        if (desigId) {
          const desig = this.allDesignations.find(d => d.designationId == Number(desigId));
          if (desig) {
            this.userData.designation = desig.designationName;
          }
        }
      },
      error: (err) => {
        console.error('Failed to load designations list:', err);
      }
    });
  }

   toggleEditMode() {
    this.editMode = !this.editMode;
     if (this.editMode) {
    // Create a deep copy of userData for editing
    this.editFormData = { ...this.userData };
  }
  }

saveProfile() {
  if (!this.editFormData) return;

  // Create payload (same as before)
  const payload = {
    empId: this.editFormData.empId,
    firstName: this.editFormData.firstName?.trim(),
    middleName: this.editFormData.middleName || '',
    lastName: this.editFormData.lastName?.trim(),
    gender: this.editFormData.gender || '',
    dateOfBirth: this.editFormData.dateOfBirth,
    email: this.editFormData.email?.trim(),
    mobileNumber: this.editFormData.phone?.toString() || this.editFormData.mobileNumber?.toString() || '',
    reportingManager: this.editFormData.manager || this.editFormData.reportingManager || '',
    userName: this.editFormData.userName || '',
    designation: this.editFormData.designation || '',
    department: this.editFormData.department || '',
    role: this.editFormData.role || '',
    joiningDate: this.editFormData.joiningDate,
    password: this.editFormData.password || '',
    address: this.editFormData.address || null,
    isManagerAssigned: this.editFormData.isManagerAssigned || false,
    managerId: this.editFormData.managerId || null
  };

  console.log('Sending Payload:', payload);

  this.apiService.saveUser(payload).subscribe({
    next: (res) => {
      // Only update userData AFTER successful save
      this.userData = { ...this.userData, ...this.editFormData };
      this.editMode = false;
    },
    error: (err) => {
      console.error('Error updating user:', err);
      // Optional: Show error message
      alert('Error updating profile. Please try again.');
    }
  });
}
           
loadUserData() {
  const empId = sessionStorage.getItem('empId');
  console.log('empId:', empId);
  

  if (!empId) {
    console.warn('Emp ID missing');
    return;
  }

  this.apiService.getUserById(empId).subscribe({
    next: (response) => {
      console.log('User API Response:', response);
      this.userData = {
        empId: response.empId,
        firstName: response.firstName,
        middleName: response.middleName,
        lastName: response.lastName,
        email: response.email,
        phone: response.mobileNumber,
        manager: response.reportingManager,
        userName: response.userName,
        designation: response.designation,
        department: response.department,
        role: response.role,
        joiningDate: response.joiningDate,  
        gender: response.gender,
        dateOfBirth: response.dateOfBirth
      };
      this.renderOrgChart(); // Ensure org chart is rendered after userData is loaded
    },
    error: (err) => {
      console.error('Error fetching user data:', err);
      this.userData = null;
    }
  });
}

  loadOfficeAddress() {
    const addressId = 1;
    const token = sessionStorage.getItem('authToken');
    
    if (!token) {
      console.warn('Authentication token missing');
      return;
    }

    this.apiService.getOfficeAddressById(addressId).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.officeAddress = {
          companyName: response.CompanyName || response.companyName,
          address: response.Address || response.address,
          city: response.City || response.city,
          state: response.State || response.state,
          country: response.Country || response.country
        };
      },
      error: (err) => {
        console.error('Error fetching address:', err);
        this.officeAddress = null;
      }
    });
  }

  userOrganization() {
    const empId = sessionStorage.getItem('empId');
    if (!empId) {
      console.warn('Emp ID missing');
      return;
    }
    this.apiService.getAllUsers().subscribe({
      next: (users: any[]) => {
        // Helper to build manager chain as an array (top-down)
        function buildManagerChainArray(user: any, users: any[]): any[] {
          const chain: any[] = [];
          let current = user;
          while (current && current.managerId) {
            const manager = users.find((u: any) => u.empId == current.managerId);
            if (manager) {
              // Unshift to add to the front (top-down order)
              chain.unshift({
                firstName: manager.firstName,
                lastName: manager.lastName,
                designation: manager.designation,
                role: manager.role,
                manager: manager.managerId ? null : null // keep null for top-most
              });
              current = manager;
            } else {
              break;
            }
          }
          return chain;
        }

        const currentUser = users.find((user: any) => user.empId == empId && user.role?.toLowerCase() === 'user');
        if (!currentUser) {
          console.warn('Current user is not user');
          return;
        }

        // Build manager chain as array
        const managersArray = buildManagerChainArray(currentUser, users);

        this.userOrgData = {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          designation: currentUser.designation,
          role: currentUser.role,
          managers: managersArray,
          employees: []
        };
        console.log(this.userOrgData);

        // Also update reportingUsers for compatibility
        let reportingUsers: { firstName: string; lastName: string; role?: string; empId?: string }[] = [];
        reportingUsers.push({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          role: currentUser.role
        });
        this.reportingUsers = reportingUsers;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching all users:', err);
      }
    });
  }

  // Holds the nested admin org data
  adminOrgData: any = null;
  // Holds the nested manager org data
  managerOrgData: any = null;

  userOrgData: any = null;

  adminOrganization() {
    const empId = sessionStorage.getItem('empId');
    if (!empId) {
      console.warn('Emp ID missing');
      return;
    }
    this.apiService.getAllUsers().subscribe({
      next: (users: any[]) => {
        const adminUser = users.find((user: any) => user.empId == empId && user.role?.toLowerCase() === 'admin');
        if (!adminUser) {
          console.warn('Current user is not admin');
          return;
        }

        // Find all managers reporting to admin
        const managerUsers = users.filter((user: any) => user.managerId == empId && user.role?.toLowerCase() === 'manager');

        // For each manager, find their employees
        const managers = managerUsers.map((manager: any) => {
          const employees = users.filter((user: any) => user.managerId == manager.empId && user.role?.toLowerCase() === 'user')
            .map((employee: any) => ({
              firstName: employee.firstName,
              lastName: employee.lastName,
              designation: employee.designation
            }));
          return {
            firstName: manager.firstName,
            lastName: manager.lastName,
            designation: manager.designation,
            employees
          };
        });

        // Build the final structure
        this.adminOrgData = {
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          designation: adminUser.designation,
          managers
        };
        console.log(this.adminOrgData);
        
  this.cdr.detectChanges();
  setTimeout(() => this.renderOrgChart(), 0);
      },
      error: (err: any) => {
        console.error('Error fetching all users:', err);
      }
    });
  }


  managerOrganization(){
    const empId = sessionStorage.getItem('empId');
    if (!empId) {
      console.warn('Emp ID missing');
      return;
    }
    this.apiService.getAllUsers().subscribe({
      next: (users: any[]) => {
        const currentUser = users.find((user: any) => user.empId == empId && user.role?.toLowerCase() === 'manager');
        if (!currentUser) {
          console.warn('Current user is not manager');
          return;
        }
        // Get current user's manager info (if any)
        let managerInfo = null;
        let managerFirstName = '';
        let managerLastName = '';
        let managerDesignation = '';
        if (currentUser.managerId) {
          managerInfo = users.find((user: any) => user.empId == currentUser.managerId);
          if (managerInfo) {
            managerFirstName = managerInfo.firstName;
            managerLastName = managerInfo.lastName;
            managerDesignation = managerInfo.designation;
            console.log('Manager:', managerFirstName, managerLastName, managerDesignation);
          }
        }

        
        // Find all employees reporting to manager
        const employeeUsers = users.filter((user: any) => user.managerId == empId && user.role?.toLowerCase() === 'user');
        const employees = employeeUsers.map((employee: any) => ({
          firstName: employee.firstName,
          lastName: employee.lastName,
          designation: employee.designation
        }));
        // Build the final structure
        const managerData = managerInfo ? {
          firstName: managerInfo.firstName,
          lastName: managerInfo.lastName,
          designation: managerInfo.designation
        } : null;
        console.log('Manager Data:', managerData);
        this.managerOrgData = {
          manager: managerData,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          designation: currentUser.designation,
          employees
        };
        console.log(this.managerOrgData);
        // Also update reportingUsers for compatibility
        let reportingUsers: { firstName: string; lastName: string; role?: string; empId?: string }[] = [];
        reportingUsers.push({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          role: currentUser.role
        });
        employees.forEach((emp: any) => {
          reportingUsers.push({
            firstName: emp.firstName,
            lastName: emp.lastName
          });
        });
        this.reportingUsers = reportingUsers;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching all users:', err);
      }
    });
  }

  getUsersReportingToMe() {
    const userRole = sessionStorage.getItem('userRole');
    if (!userRole) {
      console.warn('User role missing');
      return;
    }
    switch (userRole.toLowerCase()) {
      case 'admin':
        this.adminOrganization();
        break;
      case 'manager':
        this.managerOrganization();
        break;
      case 'user':
        this.userOrganization();
        break;
      default:
        console.warn('Unknown user role:', userRole);
    }
  }


  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

   // Initialize with empty values to prevent undefined errors
  userData: any = {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    designation: '',
    manager: '',
    joiningDate: '',
    dateOfBirth: '',
    gender: ''
  };

  officeAddress: any = {
    companyName: '',
    address: '',
    city: '',
    state: '',
    country: ''
  };
}