import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoctorsService, Doctor, TimeSlot } from '../../Data/doctors.service';

@Component({
  selector: 'app-doctor-profile-manaement',
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-profile-manaement.html',
  styleUrl: './doctor-profile-manaement.css',
})
export class DoctorProfileManaement implements OnInit {
  private isBrowser: boolean;
  
  doctorData: any = null;
  doctor: Doctor | null = null;
  originalDoctor: Doctor | null = null;
  
  loading = true;
  saving = false;
  hasChanges = false;
  
  isEditingTimings = false;
  savingTimings = false;
  
  weekDays: string[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];
  
  availableTimeSlots: { [key: string]: TimeSlot[] } = {};
  originalTimeSlots: { [key: string]: TimeSlot[] } = {};
  
  constructor(
    private router: Router,
    private doctorsService: DoctorsService,
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
    this.loadDoctorProfile();
  }

  loadDoctorProfile(): void {
    this.loading = true;
    const doctorId = this.doctorData?.doctorId || this.doctorData?.id || 1;
    
    this.doctorsService.getDoctorById(doctorId).subscribe({
      next: (data) => {
        this.doctor = { ...data };
        this.originalDoctor = JSON.parse(JSON.stringify(data));
        this.initializeTimeSlots();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  initializeTimeSlots(): void {
    if (!this.doctor) return;
    
    this.weekDays.forEach(day => {
      if (this.doctor!.timeSlots && this.doctor!.timeSlots.length > 0) {
        this.availableTimeSlots[day] = this.doctor!.timeSlots
          .filter(slot => slot.day === day)
          .map(slot => ({ ...slot }));
      } else {
        this.availableTimeSlots[day] = [];
      }
    });
    
    this.originalTimeSlots = JSON.parse(JSON.stringify(this.availableTimeSlots));
  }

  isDayAvailable(day: string): boolean {
    return this.availableTimeSlots[day] && this.availableTimeSlots[day].length > 0;
  }

  getTimeSlotsForDay(day: string): TimeSlot[] {
    return this.availableTimeSlots[day] || [];
  }

  addTimeSlot(day: string): void {
    if (!this.availableTimeSlots[day]) {
      this.availableTimeSlots[day] = [];
    }
    
    this.availableTimeSlots[day].push({
      day: day,
      startTime: '09:00',
      endTime: '10:00',
      display: '9:00 AM - 10:00 AM'
    });
    
    this.markAsChanged();
  }

  removeTimeSlot(day: string, index: number): void {
    if (confirm('Are you sure you want to remove this time slot?')) {
      this.availableTimeSlots[day].splice(index, 1);
      this.markAsChanged();
    }
  }

  updateTimeSlotDisplay(day: string, index: number): void {
    const slot = this.availableTimeSlots[day][index];
    slot.display = this.formatTimeRange(slot.startTime, slot.endTime);
  }

  toggleTimingsEdit(): void {
    this.isEditingTimings = !this.isEditingTimings;
    if (!this.isEditingTimings) {
      this.availableTimeSlots = JSON.parse(JSON.stringify(this.originalTimeSlots));
    }
  }

  saveTimings(): void {
    if (!this.doctor) return;
    
    this.savingTimings = true;
    
    const allTimeSlots: TimeSlot[] = [];
    this.weekDays.forEach(day => {
      if (this.availableTimeSlots[day]) {
        allTimeSlots.push(...this.availableTimeSlots[day]);
      }
    });
    
    const updatedDoctor: Doctor = {
      ...this.doctor,
      timeSlots: allTimeSlots,
      availableDays: this.weekDays.filter(day => this.isDayAvailable(day))
    };
    
    this.doctorsService.updateDoctor(this.doctor.id, updatedDoctor).subscribe({
      next: (data) => {
        this.doctor = { ...data };
        this.initializeTimeSlots();
        this.savingTimings = false;
        this.isEditingTimings = false;
        alert('Timings updated successfully!');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error saving timings:', err);
        alert('Failed to update timings. Please try again.');
        this.savingTimings = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatTimeRange(startTime: string, endTime: string): string {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }

  onImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.doctor) {
          this.doctor.image = e.target.result;
          this.markAsChanged();
          this.cdr.detectChanges();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  markAsChanged(): void {
    this.hasChanges = true;
  }

  onFieldChange(): void {
    this.markAsChanged();
  }

  saveChanges(): void {
    if (!this.doctor || !this.hasChanges) return;
    
    this.saving = true;
    
    const allTimeSlots: TimeSlot[] = [];
    this.weekDays.forEach(day => {
      if (this.availableTimeSlots[day]) {
        allTimeSlots.push(...this.availableTimeSlots[day]);
      }
    });
    
    const updatedDoctor: Doctor = {
      ...this.doctor,
      timeSlots: allTimeSlots,
      availableDays: this.weekDays.filter(day => this.isDayAvailable(day))
    };
    
    this.doctorsService.updateDoctor(this.doctor.id, updatedDoctor).subscribe({
      next: (data) => {
        this.doctor = { ...data };
        this.originalDoctor = JSON.parse(JSON.stringify(data));
        this.hasChanges = false;
        this.saving = false;
        
        if (this.isBrowser) {
          const updatedDoctorData = {
            ...this.doctorData,
            doctorName: data.name
          };
          localStorage.setItem('doctorData', JSON.stringify(updatedDoctorData));
        }
        
        alert('Profile updated successfully!');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error saving profile:', err);
        alert('Failed to update profile. Please try again.');
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelChanges(): void {
    if (confirm('Are you sure you want to discard all changes?')) {
      this.doctor = JSON.parse(JSON.stringify(this.originalDoctor));
      this.initializeTimeSlots();
      this.hasChanges = false;
      this.cdr.detectChanges();
    }
  }

  goToDashboard(): void {
    if (this.hasChanges) {
      if (confirm('You have unsaved changes. Do you want to leave without saving?')) {
        this.router.navigate(['/doctor/dashboard']);
      }
    } else {
      this.router.navigate(['/doctor/dashboard']);
    }
  }
}