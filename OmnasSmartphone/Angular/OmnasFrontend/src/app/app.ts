import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DeviceList } from "./components/device-list/device-list";
import { Home } from "./components/home/home";

@Component({
  selector: 'app-root',
  imports: [Home],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'OmnasFrontend';
}
