// session.service.ts
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private warningTimer: any;

  constructor(private messageService: MessageService) { }

  startSessionTimer(): void {
    console.log('Session timer started');
    this.clearTimer();

    // Show toaster 1 minute before session expiry (1 minute for 2 min session)
    // this.warningTimer = setTimeout(() => {
    //   console.log('Timer completed - showing warning');
    //   this.showSessionWarning();
    // }, 1 * 60 * 1000); // 1 minute (since token expires in 2 minutes)
    this.warningTimer = setTimeout(() => {
      console.log('Timer completed - showing warning');
      this.showSessionWarning();
    }, 59 * 60 * 1000);
  }

  private showSessionWarning(): void {
    console.log('Showing session warning toast');
    this.messageService.add({
      severity: 'warn',
      summary: 'Session Expiring',
      detail: 'Your session will expire in 1 minute',
      life: 20000
    });
  }

  private clearTimer(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      console.log('Timer cleared');
    }
  }
}