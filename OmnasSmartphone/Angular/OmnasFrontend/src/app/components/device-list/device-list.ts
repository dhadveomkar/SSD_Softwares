import { Component, OnInit } from '@angular/core';
import { SmartphoneDevice } from '../../models/device.model';
import { DeviceService } from '../../services/device';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-device-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './device-list.html',
  styleUrl: './device-list.css',
})
export class DeviceList implements OnInit {
devices: SmartphoneDevice[] = [];
  isLoaded = false; // Flag to trigger CSS animation

  constructor(private deviceService: DeviceService) {}

  ngOnInit(): void {
    this.deviceService.getDevices().subscribe({
      next: (data) => {
        this.devices = data;
        // Small timeout ensures the DOM elements exist before adding the class
        setTimeout(() => {
          this.isLoaded = true;
        }, 50);
      },
      error: (err) => console.error('Backend connection failed', err)
    });
  }
}


