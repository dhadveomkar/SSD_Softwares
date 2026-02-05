// src/app/components/device-list/device-list.component.ts
import { Component, OnInit } from '@angular/core';
import { SmartphoneDevice, TabletDevice, WearableDevice } from '../../models/device.model';
import { DeviceService } from '../../services/device';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ToastrService } from 'ngx-toastr';
import { ChartConfiguration, ChartData } from 'chart.js/auto';
import { BaseChartDirective } from 'ng2-charts';


@Component({
  selector: 'app-device-list',
  standalone: true, // Required for 'imports' to work
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './device-list.html',
  styleUrl: './device-list.css',
})
export class DeviceList implements OnInit {
  smartphones: SmartphoneDevice[] = [];
  tablets: TabletDevice[] = [];
  wearables: WearableDevice[] = [];
  allDevices: any[] = [];
  filteredDevices: any[] = [];
  searchQuery: string = '';




  searchText: string = '';
  isLoaded = false;
  newDevice: any = { deviceName: '', osVersion: '', lastSync: new Date().toISOString() };
  selectedCategory: string = 'smartphone';
  showForm: boolean = false;
  editingDeviceId: number | null = null;
  showSmartphones = true;
  showTablets = true;
  showWearables = true;
  currentSort = 'name';

  constructor(private deviceService: DeviceService, private toastr: ToastrService) { }

  ngOnInit(): void {
  this.deviceService.getCombinedInventory().subscribe({
    next: (data) => {
      this.smartphones = data.smartphones || [];
      this.tablets = data.tablets || [];
      this.wearables = data.wearables || [];

      // Combine all arrays into one for the Analytics logic
      this.allDevices = [...this.smartphones, ...this.tablets, ...this.wearables];

      // CRITICAL: Call the update method here so the chart draws!
      this.updateAnalytics();

      setTimeout(() => { this.isLoaded = true; }, 100);
    },
    error: (err) => console.error('Backend connection failed', err)
  });
}

  // Getters for filtering remain the same...
  get filteredSmartphones() { return this.applyFilter(this.smartphones); }
  get filteredTablets() { return this.applyFilter(this.tablets); }
  get filteredWearables() { return this.applyFilter(this.wearables); }

  private applyFilter(devices: any[]) {
    return devices.filter(device =>
      device.deviceName.toLowerCase().includes(this.searchText.toLowerCase()) ||
      device.osVersion.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  submitDevice() {
    this.deviceService.addDevice(this.selectedCategory, this.newDevice).subscribe({
      next: () => {
        // Show Success Toast
        this.toastr.success(`${this.newDevice.deviceName} has been added successfully!`, 'Inventory Updated');

        this.ngOnInit();
        this.showForm = false;
        this.newDevice = { deviceName: '', osVersion: '', lastSync: new Date().toISOString() };
      },
      error: (err) => {
        // Show Error Toast
        this.toastr.error("Database connection failed. Could not add device.", "Error");
      }
    });
  }

  onEdit(device: any) {
    this.editingDeviceId = device.id;
    this.toastr.info(`Editing ${device.deviceName}`, 'Edit Mode');
  }

  onSaveEdit(category: string, device: any) {
    this.deviceService.updateDevice(category, device.id, device).subscribe({
      next: () => {
        this.toastr.success('Changes saved successfully!', 'Update Complete');
        this.editingDeviceId = null;
        this.ngOnInit();
      },
      error: () => this.toastr.error('Failed to update device.', 'Error')
    });
  }

  onDelete(category: string, id: number) {
    if (confirm('Are you sure you want to delete this device?')) {
      this.deviceService.deleteDevice(category, id).subscribe({
        next: () => {
          this.toastr.warning('Device has been permanently removed.', 'Deleted');
          this.ngOnInit();
        },
        error: () => this.toastr.error('Could not delete device.', 'Error')
      });
    }
  }

  // Add this helper method inside your class
  get totalDevices(): number {
    return this.smartphones.length + this.tablets.length + this.wearables.length;
  }

  // Validation Helper
  isDeviceValid(device: any): boolean {
    return device.deviceName?.trim().length > 0 && device.osVersion?.trim().length > 0;
  }

  // Sync Simulator logic
  onSync(category: string, device: any) {
    device.lastSync = new Date().toISOString();
    this.deviceService.updateDevice(category, device.id, device).subscribe(() => {
      console.log(`${device.deviceName} synced!`);
    });
  }

  // Inside your class:

  exportToExcel() {
    const allDevices = [
      ...this.smartphones.map(d => ({ ...d, Category: 'Smartphone' })),
      ...this.tablets.map(d => ({ ...d, Category: 'Tablet' })),
      ...this.wearables.map(d => ({ ...d, Category: 'Wearable' }))
    ];

    const worksheet = XLSX.utils.json_to_sheet(allDevices);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    XLSX.writeFile(workbook, 'Omnas_Inventory_Report.xlsx');

    this.toastr.info('Excel report is downloading...', 'Export Started');
  }

  exportToPDF() {
    const doc = new jsPDF();
    const date = new Date().toLocaleString();

    // --- 1. GENERATE VECTOR LOGO (Code-based Logo) ---
    // Draw a Blue Rounded Square/Circle as the Logo Background
    doc.setFillColor(0, 123, 255); // Omnas Blue
    doc.roundedRect(14, 10, 12, 12, 3, 3, 'F');

    // Draw a White "O" symbol inside
    doc.setLineWidth(1.5);
    doc.setDrawColor(255, 255, 255);
    doc.ellipse(20, 16, 3, 3, 'S');

    // --- 2. HEADER TITLE & SUBTITLE ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(40, 44, 52);
    doc.text('OMNAS', 30, 19); // Brand Name next to logo

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Device Inventory Management Report', 30, 24);
    doc.text(`Run Date: ${date}`, 140, 24);

    // --- 3. DECORATIVE DIVIDER ---
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 123, 255);
    doc.line(14, 32, 196, 32);

    // --- 4. DATA PREPARATION ---
    const data = [
      ...this.smartphones.map(d => [d.deviceName, d.osVersion, new Date(d.lastSync).toLocaleDateString(), 'Smartphone']),
      ...this.tablets.map(d => [d.deviceName, d.osVersion, new Date(d.lastSync).toLocaleDateString(), 'Tablet']),
      ...this.wearables.map(d => [d.deviceName, d.osVersion, new Date(d.lastSync).toLocaleDateString(), 'Wearable'])
    ];

    // --- 5. GENERATE TABLE ---
    autoTable(doc, {
      head: [['Device Name', 'OS Version', 'Last Sync', 'Category']],
      body: data,
      startY: 40,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 123, 255],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 }
    });

    // --- 6. FOOTER (Page Numbers) ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(9);
    doc.setTextColor(150);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Omnas Systems Confidential - Page ${i} of ${pageCount}`, 14, 285);
    }

    // --- 7. SAVE ---
    doc.save(`Omnas_Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    this.toastr.success('PDF report generated successfully!', 'Export Complete');
  }

  // Inside your DeviceList class
public osChartData: ChartData<'pie'> = {
  labels: ['Android 15', 'Android 14', 'Android 13', 'Other'],
  datasets: [{ 
    data: [0, 0, 0, 0],
    // Add these colors
    backgroundColor: ['#28a745', '#007bff', '#ffc107', '#6c757d'],
    hoverBackgroundColor: ['#218838', '#0069d9', '#e0a800', '#5a6268']
  }]
};

public osChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 2000,
    easing: 'easeOutQuart' // Smooth "growing" animation on load
  },
  plugins: {
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { size: 12, weight: 'bold' }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.raw || 0;
          return ` ${label}: ${value} Devices`;
        }
      }
    }
  }
};

// Add this to your refreshData() method after this.allDevices is populated
updateAnalytics() {
  const versions = { a15: 0, a14: 0, a13: 0, other: 0 };
  
  this.allDevices.forEach(d => {
    const os = d.osVersion.toLowerCase();
    if (os.includes('15')) versions.a15++;
    else if (os.includes('14')) versions.a14++;
    else if (os.includes('13')) versions.a13++;
    else versions.other++;
  });

  this.osChartData.datasets[0].data = [versions.a15, versions.a14, versions.a13, versions.other];
}

// Status Indicator Helper
getHealthStatus(lastSync: string): string {
  const diff = new Date().getTime() - new Date(lastSync).getTime();
  const hours = diff / (1000 * 60 * 60);
  
  if (hours < 24) return 'status-green';  // Healthy
  if (hours < 72) return 'status-yellow'; // Needs attention
  return 'status-red';                    // Critical/Offline
}

getCountByStatus(color: string): number {
  const all = [...this.smartphones, ...this.tablets, ...this.wearables];
  
  return all.filter(d => {
    // Force lastSync to a string so getHealthStatus doesn't crash
    const status = this.getHealthStatus(String(d.lastSync)); 
    return status === `status-${color}`;
  }).length;
}

// 2. Resolve 'Property filterByStatus does not exist' error
filterByStatus(status: string) {
  this.toastr.info(`Filtering view for ${status} devices...`, 'Fleet Filter');
  // You can later add actual filter logic here to hide/show specific cards
}

}