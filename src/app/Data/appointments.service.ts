import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Appointment {
  id: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  reasonForVisit: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  doctorId: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  
  // Dummy data - will be replaced with API calls later
  private appointments: Appointment[] = [
    {
      id: 1,
      patientName: 'Ahmed Ali',
      patientEmail: 'ahmed.ali@email.com',
      patientPhone: '+92 300 1234567',
      appointmentDate: '2026-01-19',
      appointmentTime: '09:00',
      reasonForVisit: 'Chest pain and shortness of breath',
      status: 'pending',
      priority: 'high',
      doctorId: 1,
      createdAt: '2026-01-18T10:30:00Z'
    },
    {
      id: 2,
      patientName: 'Fatima Khan',
      patientEmail: 'fatima.khan@email.com',
      patientPhone: '+92 301 2345678',
      appointmentDate: '2026-01-19',
      appointmentTime: '10:30',
      reasonForVisit: 'Regular checkup',
      status: 'confirmed',
      priority: 'low',
      doctorId: 1,
      createdAt: '2026-01-17T14:20:00Z'
    },
    {
      id: 3,
      patientName: 'Hassan Raza',
      patientEmail: 'hassan.raza@email.com',
      patientPhone: '+92 302 3456789',
      appointmentDate: '2026-01-19',
      appointmentTime: '14:00',
      reasonForVisit: 'Follow-up on blood test results',
      status: 'pending',
      priority: 'medium',
      doctorId: 1,
      createdAt: '2026-01-16T09:15:00Z'
    },
    {
      id: 4,
      patientName: 'Ayesha Malik',
      patientEmail: 'ayesha.malik@email.com',
      patientPhone: '+92 303 4567890',
      appointmentDate: '2026-01-19',
      appointmentTime: '15:30',
      reasonForVisit: 'Severe headache and dizziness',
      status: 'pending',
      priority: 'high',
      doctorId: 1,
      createdAt: '2026-01-18T08:45:00Z'
    },
    {
      id: 5,
      patientName: 'Bilal Ahmed',
      patientEmail: 'bilal.ahmed@email.com',
      patientPhone: '+92 304 5678901',
      appointmentDate: '2026-01-20',
      appointmentTime: '09:30',
      reasonForVisit: 'Diabetes consultation',
      status: 'pending',
      priority: 'medium',
      doctorId: 1,
      createdAt: '2026-01-18T11:00:00Z'
    },
    {
      id: 6,
      patientName: 'Sara Noor',
      patientEmail: 'sara.noor@email.com',
      patientPhone: '+92 305 6789012',
      appointmentDate: '2026-01-18',
      appointmentTime: '11:00',
      reasonForVisit: 'Back pain',
      status: 'completed',
      priority: 'low',
      doctorId: 1,
      createdAt: '2026-01-17T16:30:00Z'
    }
  ];

  constructor() {}

  // Get all appointments for a doctor
  getAppointmentsByDoctor(doctorId: number): Observable<Appointment[]> {
    const doctorAppointments = this.appointments.filter(app => app.doctorId === doctorId);
    return of(doctorAppointments).pipe(delay(0)); // Simulate API delay
  }

  // Get today's appointments
  getTodaysAppointments(doctorId: number): Observable<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = this.appointments.filter(
      app => app.doctorId === doctorId && app.appointmentDate === today
    );
    return of(todaysAppointments).pipe(delay(500));
  }

  // Get appointments by status
  getAppointmentsByStatus(doctorId: number, status: string): Observable<Appointment[]> {
    const filteredAppointments = this.appointments.filter(
      app => app.doctorId === doctorId && app.status === status
    );
    return of(filteredAppointments).pipe(delay(500));
  }

  // Confirm appointment
  confirmAppointment(appointmentId: number): Observable<Appointment> {
    const appointment = this.appointments.find(app => app.id === appointmentId);
    if (appointment) {
      appointment.status = 'confirmed';
    }
    return of(appointment!).pipe(delay(300));
  }

  // Complete appointment
  completeAppointment(appointmentId: number): Observable<Appointment> {
    const appointment = this.appointments.find(app => app.id === appointmentId);
    if (appointment) {
      appointment.status = 'completed';
    }
    return of(appointment!).pipe(delay(300));
  }

  // Cancel appointment
  cancelAppointment(appointmentId: number): Observable<Appointment> {
    const appointment = this.appointments.find(app => app.id === appointmentId);
    if (appointment) {
      appointment.status = 'cancelled';
    }
    return of(appointment!).pipe(delay(300));
  }

  // Get appointment counts by status
  getAppointmentCounts(doctorId: number): Observable<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  }> {
    const doctorAppointments = this.appointments.filter(app => app.doctorId === doctorId);
    
    const counts = {
      total: doctorAppointments.length,
      pending: doctorAppointments.filter(app => app.status === 'pending').length,
      confirmed: doctorAppointments.filter(app => app.status === 'confirmed').length,
      completed: doctorAppointments.filter(app => app.status === 'completed').length,
      cancelled: doctorAppointments.filter(app => app.status === 'cancelled').length
    };
    
    return of(counts).pipe(delay(300));
  }
}