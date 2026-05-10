import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DoctorLoginRequest {
  username: string;
  password: string;
}

export interface DoctorLoginResponse {
  success: boolean;
  message?: string;
  data?: {
    doctorId: number;
    doctorName: string;
    username: string;
  };
}

export interface DoctorCredential {
  id: number;
  doctorId: number;
  doctorName: string;
  username: string;
  hasPassword: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class CredentialsService {
  private apiUrl = 'http://20.13.9.186/hospital/api/credentials';

  constructor(private http: HttpClient) {}

  // Verify login
  verifyLogin(credentials: DoctorLoginRequest): Observable<DoctorLoginResponse> {
    return this.http.post<DoctorLoginResponse>(`${this.apiUrl}/verify-login`, credentials);
  }

  // Get credentials by doctor ID
  getCredentialsByDoctorId(doctorId: number): Observable<DoctorCredential> {
    return this.http.get<{ success: boolean; data: DoctorCredential }>(`${this.apiUrl}/doctor/${doctorId}`)
      .pipe(map(response => response.data));
  }

  // Update password (for logged-in doctor)
  updatePassword(credentialId: number, passwordData: UpdatePasswordRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${credentialId}`, {
      password: passwordData.newPassword
    });
  }

  // Update username and/or password
  updateCredentials(credentialId: number, data: { username?: string; password?: string }): Observable<DoctorCredential> {
    return this.http.put<{ success: boolean; data: DoctorCredential }>(`${this.apiUrl}/${credentialId}`, data)
      .pipe(map(response => response.data));
  }
}