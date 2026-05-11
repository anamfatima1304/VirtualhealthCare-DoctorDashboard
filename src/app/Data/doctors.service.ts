import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  education: string;
  image: string;
  availableDays: string[];
  timeSlots?: TimeSlot[]; // Add this
  shortBio: string;
  consultationFee: string;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  display: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorsService {
  private apiUrl = 'https://20-13-9-186.nip.io/hospital/api/doctors';
  
  // Keep local data as fallback
  private localDoctors: Doctor[] = [
    {
      id: 1,
      name: 'Dr. Sarah Haider',
      specialty: 'Cardiologist',
      experience: '15 years',
      education: 'MD, Harvard Medical School',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
        { day: 'Monday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
        { day: 'Wednesday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
        { day: 'Wednesday', startTime: '15:00', endTime: '17:00', display: '3:00 PM - 5:00 PM' },
        { day: 'Friday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
        { day: 'Friday', startTime: '15:00', endTime: '16:00', display: '3:00 PM - 4:00 PM' }
      ],
      shortBio: 'Specialist in cardiovascular diseases with extensive experience in heart surgery.',
      consultationFee: 'Rs. 200'
    },
    {
      id: 2,
      name: 'Dr. Mustafa Hassan',
      specialty: 'Neurologist',
      experience: '12 years',
      education: 'MD, Johns Hopkins University',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      timeSlots: [
        { day: 'Tuesday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
        { day: 'Tuesday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
        { day: 'Thursday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
        { day: 'Thursday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
        { day: 'Saturday', startTime: '10:00', endTime: '13:00', display: '10:00 AM - 1:00 PM' }
      ],
      shortBio: 'Expert in treating neurological disorders and brain-related conditions.',
      consultationFee: 'Rs. 180'
    },
    {
      id: 3,
      name: 'Dr. Eman Aslam',
      specialty: 'Pediatrician',
      experience: '10 years',
      education: 'MD, Stanford University',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
      availableDays: ['Monday', 'Tuesday', 'Thursday'],
      timeSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
        { day: 'Monday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
        { day: 'Tuesday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
        { day: 'Tuesday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
        { day: 'Thursday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
        { day: 'Thursday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' }
      ],
      shortBio: 'Dedicated to providing comprehensive healthcare for children and adolescents.',
      consultationFee: 'Rs. 150'
    },
    {
      id: 4,
      name: 'Dr. Ahmed Raza',
      specialty: 'Orthopedic Surgeon',
      experience: '18 years',
      education: 'MD, Mayo Clinic',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
      availableDays: ['Wednesday', 'Friday', 'Saturday'],
      timeSlots: [
        { day: 'Wednesday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
        { day: 'Wednesday', startTime: '15:00', endTime: '17:00', display: '3:00 PM - 5:00 PM' },
        { day: 'Friday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
        { day: 'Friday', startTime: '15:00', endTime: '16:00', display: '3:00 PM - 4:00 PM' },
        { day: 'Saturday', startTime: '10:00', endTime: '13:00', display: '10:00 AM - 1:00 PM' }
      ],
      shortBio: 'Specializes in joint replacement and sports medicine injuries.',
      consultationFee: 'Rs. 220'
    },
    {
      id: 5,
      name: 'Dr. Aslam Qureshi',
      specialty: 'Dermatologist',
      experience: '8 years',
      education: 'MD, UCLA Medical School',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
        { day: 'Monday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
        { day: 'Wednesday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
        { day: 'Wednesday', startTime: '15:00', endTime: '17:00', display: '3:00 PM - 5:00 PM' },
        { day: 'Friday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
        { day: 'Friday', startTime: '15:00', endTime: '16:00', display: '3:00 PM - 4:00 PM' }
      ],
      shortBio: 'Expert in skin conditions, cosmetic procedures, and dermatological surgery.',
      consultationFee: 'Rs. 160'
    },
    {
      id: 6,
      name: 'Dr. Dawood Khan',
      specialty: 'General Surgeon',
      experience: '14 years',
      education: 'MD, Yale Medical School',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      timeSlots: [
        { day: 'Tuesday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
        { day: 'Tuesday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
        { day: 'Thursday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
        { day: 'Thursday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
        { day: 'Saturday', startTime: '10:00', endTime: '13:00', display: '10:00 AM - 1:00 PM' }
      ],
      shortBio: 'Skilled in minimally invasive surgical techniques and emergency procedures.',
      consultationFee: 'Rs. 190'
    }
  ];

  constructor(private http: HttpClient) {}

  // Get local doctors synchronously (for backward compatibility)
  get doctors(): Doctor[] {
    return this.localDoctors;
  }

  // Get all doctors from API (with local fallback)
  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<{ success: boolean; data: Doctor[] }>(this.apiUrl)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.warn('API not available, using local data', error);
          return of(this.localDoctors);
        })
      );
  }

  // Get doctor by ID
  getDoctorById(id: number): Observable<Doctor> {
    return this.http.get<{ success: boolean; data: Doctor }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.warn('API not available, using local data', error);
          const doctor = this.localDoctors.find(d => d.id === id);
          return of(doctor!);
        })
      );
  }

  // Get doctors by specialty
  getDoctorsBySpecialty(specialty: string): Observable<Doctor[]> {
    return this.http.get<{ success: boolean; data: Doctor[] }>(`${this.apiUrl}/specialty/${specialty}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.warn('API not available, using local data', error);
          const doctors = this.localDoctors.filter(d => 
            d.specialty.toLowerCase().includes(specialty.toLowerCase())
          );
          return of(doctors);
        })
      );
  }

  // Get doctors by available day
  getDoctorsByDay(day: string): Observable<Doctor[]> {
    return this.http.get<{ success: boolean; data: Doctor[] }>(`${this.apiUrl}/day/${day}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.warn('API not available, using local data', error);
          const doctors = this.localDoctors.filter(d => 
            d.availableDays.some(availDay => 
              availDay.toLowerCase() === day.toLowerCase()
            )
          );
          return of(doctors);
        })
      );
  }

  // Create new doctor
  createDoctor(doctor: Doctor): Observable<Doctor> {
    return this.http.post<{ success: boolean; data: Doctor }>(this.apiUrl, doctor)
      .pipe(map(response => response.data));
  }

  // Update doctor
  updateDoctor(id: number, doctor: Doctor): Observable<Doctor> {
    return this.http.put<{ success: boolean; data: Doctor }>(`${this.apiUrl}/${id}`, doctor)
      .pipe(map(response => response.data));
  }

  // Delete doctor
  deleteDoctor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}