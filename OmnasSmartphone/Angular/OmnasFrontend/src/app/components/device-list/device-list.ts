// src/app/components/device-list/device-list.component.ts
import { Component, OnInit } from '@angular/core';
import { SmartphoneDevice, TabletDevice, WearableDevice } from '../../models/device.model';
import { DeviceService } from '../../services/device';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-device-list',
  standalone: true, // Required for 'imports' to work
  imports: [CommonModule, FormsModule],
  templateUrl: './device-list.html',
  styleUrl: './device-list.css',
})
export class DeviceList implements OnInit {
  smartphones: SmartphoneDevice[] = [];
  tablets: TabletDevice[] = [];
  wearables: WearableDevice[] = [];
  
  searchText: string = '';
  isLoaded = false;

  constructor(private deviceService: DeviceService) {}

  ngOnInit(): void {
    // Calling the single "live-data" endpoint from your InventoryController
    this.deviceService.getCombinedInventory().subscribe({
      next: (data) => {
        // Map the backend property names (Smartphones, Tablets, Wearables) 
        // to your component variables
        this.smartphones = data.smartphones || [];
        this.tablets = data.tablets || [];
        this.wearables = data.wearables || [];

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
}