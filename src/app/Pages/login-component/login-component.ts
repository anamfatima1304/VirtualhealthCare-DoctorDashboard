import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CredentialsService, DoctorLoginRequest } from '../../Data/credentials.service';

@Component({
  selector: 'app-login-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  private isBrowser: boolean;
  
  loginData: DoctorLoginRequest = {
    username: '',
    password: ''
  };
  
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  
  constructor(
    private router: Router,
    private credentialsService: CredentialsService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      const doctorData = localStorage.getItem('doctorData');
      
      if (doctorData) {
        this.router.navigate(['/doctor/dashboard']);
      }
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.credentialsService.verifyLogin(this.loginData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const doctor = response.data;
          
          this.successMessage = 'Login successful! Redirecting...';
          
          if (this.isBrowser) {
            localStorage.setItem('doctorData', JSON.stringify(doctor));
          }
          
          this.loading = false;
          this.router.navigate(['/doctor/dashboard']);
        } else {
          this.errorMessage = response.message || 'Login failed. Please try again.';
          this.loading = false;
        }
      },
      error: (error) => {
        this.loading = false;
        
        if (error.status === 401) {
          this.errorMessage = 'Invalid username or password. Please try again.';
        } else {
          this.errorMessage = error.error?.message || 'An error occurred. Please try again later.';
        }
      }
    });
  }

  onForgotPassword() {
    alert('Please contact the administrator to reset your password.');
  }
}