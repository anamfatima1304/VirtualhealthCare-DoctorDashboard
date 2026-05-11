import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable, map } from 'rxjs';

export interface Appointment {
  id: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: string; 
  time: string; 
  reasonForVisit: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'Scheduled';
  priority: 'high' | 'medium' | 'low' | 'High' | 'Medium' | 'Normal';
  doctorId: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  
  private apiUrl = 'http://20.13.9.186.nip.io/hospital/api/appointments'; 

  constructor(private http: HttpClient) {}

  // 1. Get all appointments for a specific doctor
  getAppointmentsByDoctor(doctorId: number): Observable<Appointment[]> {
    return this.http.get<{success: boolean, data: Appointment[]}>(`${this.apiUrl}/doctor/${doctorId}`)
      .pipe(map(response => response.data));
  }

  // 2. Calculate counts for the dashboard stats
  getAppointmentCounts(doctorId: number): Observable<any> {
    return this.getAppointmentsByDoctor(doctorId).pipe(
      map(appointments => {
        return {
          total: appointments.length,
          pending: appointments.filter(a => a.status.toLowerCase() === 'pending' || a.status === 'Scheduled').length,
          confirmed: appointments.filter(a => a.status.toLowerCase() === 'confirmed').length,
          completed: appointments.filter(a => a.status.toLowerCase() === 'completed').length,
          cancelled: appointments.filter(a => a.status.toLowerCase() === 'cancelled').length
        };
      })
    );
  }

  // 3. Update Status - Matches Backend: router.put('/:id/status', ...)
  confirmAppointment(appointmentId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${appointmentId}/status`, { status: 'confirmed' });
  }

  completeAppointment(appointmentId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${appointmentId}/status`, { status: 'completed' });
  }

  cancelAppointment(appointmentId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${appointmentId}/status`, { status: 'cancelled' });
  }
}