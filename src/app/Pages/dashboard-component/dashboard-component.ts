import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment, AppointmentsService } from '../../Data/appointments.service';

@Component({
  selector: 'app-dashboard-component',
  imports: [CommonModule],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css',
})
export class DashboardComponent implements OnInit {
  private isBrowser: boolean;
  
  doctorData: any = null;
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  
  stats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0
  };
  
  selectedFilter: 'all' | 'today' | 'pending' | 'confirmed' | 'completed' = 'all';
  selectedPriority: 'all' | 'high' | 'medium' | 'low' = 'all';
  
  loading = true;
  
  constructor(
    private router: Router,
    private appointmentsService: AppointmentsService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      this.loading = false;
      return;
    }

    const storedData = localStorage.getItem('doctorData');
    if (!storedData) {
      this.router.navigate(['/doctor/login']);
      return;
    }
    
    this.doctorData = JSON.parse(storedData);
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    if (!this.doctorData) {
      return;
    }

    this.loading = true;
    const doctorId = this.doctorData.doctorId || 1;
    
    this.appointmentsService.getAppointmentsByDoctor(doctorId).subscribe({
      next: (data) => {
        this.appointments = data;
        this.applyFilters();
        this.loadStats();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadStats(): void {
    if (!this.doctorData) {
      return;
    }

    const doctorId = this.doctorData.doctorId || 1;
    this.appointmentsService.getAppointmentCounts(doctorId).subscribe({
      next: (counts) => {
        this.stats = {
          total: counts.total,
          pending: counts.pending,
          confirmed: counts.confirmed,
          completed: counts.completed
        };
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.appointments];
    
    if (this.selectedFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(app => app.appointmentDate === today);
    } else if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(app => app.status === this.selectedFilter);
    }
    
    if (this.selectedPriority !== 'all') {
      filtered = filtered.filter(app => app.priority === this.selectedPriority);
    }
    
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate} ${a.appointmentTime}`);
      const dateB = new Date(`${b.appointmentDate} ${b.appointmentTime}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    this.filteredAppointments = filtered;
  }

  setFilter(filter: 'all' | 'today' | 'pending' | 'confirmed' | 'completed'): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  setPriorityFilter(priority: 'all' | 'high' | 'medium' | 'low'): void {
    this.selectedPriority = priority;
    this.applyFilters();
  }

  confirmAppointment(appointmentId: number): void {
    this.appointmentsService.confirmAppointment(appointmentId).subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error confirming appointment:', err);
      }
    });
  }

  completeAppointment(appointmentId: number): void {
    this.appointmentsService.completeAppointment(appointmentId).subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error completing appointment:', err);
      }
    });
  }

  cancelAppointment(appointmentId: number): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentsService.cancelAppointment(appointmentId).subscribe({
        next: () => {
          this.loadDashboardData();
        },
        error: (err) => {
          console.error('Error cancelling appointment:', err);
        }
      });
    }
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('doctorData');
    }
    this.router.navigate(['/doctor/login']);
  }

  goToProfile(): void {
    this.router.navigate(['/doctor/profile']);
  }
}