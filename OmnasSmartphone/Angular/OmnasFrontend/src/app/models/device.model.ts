export interface SmartphoneDevice {
  id: number;
  deviceName: string;
  osVersion: string;
  lastSync: Date;
}

export interface TabletDevice extends SmartphoneDevice {}
export interface WearableDevice extends SmartphoneDevice {}