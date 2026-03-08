import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment, AppointmentsService } from '../../Data/appointments.service';

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
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
  selectedPriority: string = 'all'; 
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
    // Dynamically uses the ID from login data
    if (!this.doctorData || !this.doctorData.doctorId) return;

    this.loading = true;
    const doctorId = this.doctorData.doctorId; 
    
    this.appointmentsService.getAppointmentsByDoctor(doctorId).subscribe({
      next: (data: any) => {
        this.appointments = data;
        this.applyFilters();
        this.loadStats(doctorId);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading appointments:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadStats(doctorId: number): void {
    this.appointmentsService.getAppointmentCounts(doctorId).subscribe({
      next: (counts: any) => {
        this.stats = { 
          total: counts.total || 0,
          pending: counts.pending || 0,
          confirmed: counts.confirmed || 0,
          completed: counts.completed || 0
        };
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.appointments];
    
    if (this.selectedFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(app => {
        const appDate = new Date(app.appointmentDate).toISOString().split('T')[0];
        return appDate === today;
      });
    } else if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(app => app.status.toLowerCase() === this.selectedFilter.toLowerCase());
    }
    
    if (this.selectedPriority !== 'all') {
      filtered = filtered.filter(app => app.priority.toLowerCase() === this.selectedPriority.toLowerCase());
    }
    
    this.filteredAppointments = filtered;
  }

  // --- Actions that call the Update Status Route ---
  confirmAppointment(id: number): void {
    this.appointmentsService.confirmAppointment(id).subscribe(() => this.loadDashboardData());
  }

  completeAppointment(id: number): void {
    this.appointmentsService.completeAppointment(id).subscribe(() => this.loadDashboardData());
  }

  cancelAppointment(id: number): void {
    if(confirm("Are you sure you want to cancel?")) {
      this.appointmentsService.cancelAppointment(id).subscribe(() => this.loadDashboardData());
    }
  }

  // --- Helpers & UI ---
  setFilter(filter: any): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  setPriorityFilter(priority: string): void {
    this.selectedPriority = priority;
    this.applyFilters();
  }

  formatTime(time: string): string {
    if (!time) return '';
    if (time.includes('AM') || time.includes('PM')) return time;
    const [hours, minutes] = time.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  }

  formatDate(date: any): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority?.toLowerCase() || 'normal'}`;
  }

  getStatusClass(status: string): string {
    return `status-${status?.toLowerCase() || 'pending'}`;
  }

  goToProfile(): void {
    this.router.navigate(['/doctor/profile']);
  }

  logout(): void {
    if (this.isBrowser) localStorage.removeItem('doctorData');
    this.router.navigate(['/doctor/login']);
  }
}