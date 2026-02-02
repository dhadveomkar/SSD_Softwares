import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ApiService } from '../../../services/services';
// import { HttpClientModule } from '@angular/common/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SessionService } from '../../session-service/session-service.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ToastModule],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  router = inject(Router);
  //username: string = 'Arati';
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  apiService = inject(ApiService);
  messageService = inject(MessageService);
  sessionService = inject(SessionService);

  showForgotPasswordPopup: boolean = false;
  forgotEmail: string = '';

  otpSent: boolean = false;
  enteredOtp: string = '';
  otpVerified: boolean = false;
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private http: HttpClient) { }

  showToastSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Login Successful',
      detail: message
    });
  }


  showToastError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Login Failed',
      detail: message
    });
  }

  login() {
    if (this.email && this.password) {
      const payload = {
        email: this.email,
        password: this.password
      };

      this.apiService.login(payload).subscribe({
        next: (response: any) => {
          console.log('Login successful:', response);

          // ✅ Save token
          sessionStorage.setItem('authToken', response.token);
          sessionStorage.setItem('email', response.user.email);
          // ✅ Save empId from nested "user" object
          sessionStorage.setItem('empId', response.user.empId);
          // Store user role 
          sessionStorage.setItem('userRole', response.user.role);
          sessionStorage.setItem('userName', response.user.firstName);
          sessionStorage.setItem('companyName', response.user.companyName);
          sessionStorage.setItem('holiday', response.user.holiday);
          sessionStorage.setItem('timesheet', response.user.timesheet);
           sessionStorage.setItem('userLastName', response.user.lastName);
           sessionStorage.setItem('joiningDate', response.user.joiningDate);
           sessionStorage.setItem('CompanyId', response.user.companyId);
           sessionStorage.setItem('roleId', response.user.roleId);
           sessionStorage.setItem('departmentId', response.user.departmentId);
           sessionStorage.setItem('designationId', response.user.designationId);

          // Set flag to trigger leave approval page reload after login
          sessionStorage.setItem('reloadLeaveApprovalAfterLogin', 'true');

          // ✅ Start session timer after successful login
          this.sessionService.startSessionTimer();
          
          // Show toast success message
          this.showToastSuccess('You have logged in successfully.');

          // ✅ Wait 3 seconds before navigating to home page
          setTimeout(() => {
            this.router.navigate(['/home-page']);
          }, 3000);
        },
        error: (error: any) => {
          console.error('Login failed:', error);
          // Show toast error message
          this.showToastError('Invalid email or password.');
        }
      });
    } else {
      this.showToastError('Please enter email and password.');
    }
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }


  // openForgotPasswordPopup() {
  //   this.showForgotPasswordPopup = true;
  //   this.forgotEmail = '';
  // }

  // closeForgotPasswordPopup() {
  //   this.showForgotPasswordPopup = false;
  // }

  // submitForgotPassword() {
  //   if (this.forgotEmail) {
  //     const payload = { Email: this.forgotEmail };

  //     this.apiService.forgotPassword(payload).subscribe({
  //       next: (response: any) => {
  //         // Show toast success message
  //         this.showToastSuccess('Password reset OTP send your mobile.');
  //         this.closeForgotPasswordPopup();
  //       },
  //       error: (error: any) => {
  //         console.error('Forgot password failed:', error);
  //         this.showToastError('Failed to send OTP.');
  //       }
  //     });
  //   } else {
  //     this.showToastError('Please enter your email or username.');
  //   }
  // }

  openForgotPasswordPopup() {
    this.showForgotPasswordPopup = true;
    // Reset all states when opening popup
    this.resetForgotPasswordFlow();
  }

  closeForgotPasswordPopup() {
    this.showForgotPasswordPopup = false;
    this.resetForgotPasswordFlow();
  }

  resetForgotPasswordFlow() {
    this.otpSent = false;
    this.otpVerified = false;
    this.forgotEmail = '';
    this.enteredOtp = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  submitForgotPassword() {
    if (this.forgotEmail) {
      const payload = { Email: this.forgotEmail };

      this.apiService.forgotPassword(payload).subscribe({
        next: (response: any) => {
          this.showToastSuccess('OTP sent to your email.');
          // Don't close popup - move to next step
          this.otpSent = true;
        },
        error: (error: any) => {
          console.error('Forgot password failed:', error);
          this.showToastError('Failed to send OTP. Please check your email/username.');
        }
      });
    } else {
      this.showToastError('Please enter your email or username.');
    }
  }

  verifyOtp() {
    if (!this.enteredOtp) {
      this.showToastError("Please enter OTP.");
      return;
    }

    if (!this.forgotEmail) {
      this.showToastError("Email not found. Please start the process again.");
      return;
    }

    const payload = { Email: this.forgotEmail, Otp: this.enteredOtp };

    this.apiService.verifyOtp(payload).subscribe({
      next: (response: any) => {
        this.showToastSuccess("OTP verified successfully.");
        this.otpVerified = true;
      },
      error: (error: any) => {
        console.error("OTP verification failed:", error);
        this.showToastError("Invalid or expired OTP.");
      }
    });
  }

  resetPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.showToastError("Please enter new password and confirm it.");
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showToastError("Passwords do not match.");
      return;
    }

    // Add password strength validation if needed
    if (this.newPassword.length < 6) {
      this.showToastError("Password must be at least 6 characters long.");
      return;
    }

    const payload = {
      Email: this.forgotEmail,
      NewPassword: this.newPassword,
      ConfirmPassword: this.confirmPassword
    };

    this.apiService.resetPassword(payload).subscribe({
      next: (response: any) => {
        this.showToastSuccess("Password reset successfully!");

        // Close popup after successful reset
        setTimeout(() => {
          this.closeForgotPasswordPopup();
        }, 2000);
      },
      error: (error: any) => {
        console.error("Reset password failed:", error);
        this.showToastError("Password reset failed. Please try again.");
      }
    });
  }

  resendOtp() {
    if (!this.forgotEmail) {
      this.showToastError("Email not found. Please start the process again.");
      return;
    }

    const payload = { Email: this.forgotEmail };

    this.apiService.forgotPassword(payload).subscribe({
      next: (response: any) => {
        this.showToastSuccess('New OTP sent to your email.');
        this.enteredOtp = ''; // Clear previous OTP
      },
      error: (error: any) => {
        console.error('Resend OTP failed:', error);
        this.showToastError('Failed to resend OTP.');
      }
    });
  }
}
