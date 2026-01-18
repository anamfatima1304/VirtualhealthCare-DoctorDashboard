import { Routes } from '@angular/router';
import { LoginComponent } from './Pages/login-component/login-component';
import { DashboardComponent } from './Pages/dashboard-component/dashboard-component';
import { DoctorProfileManaement } from './Pages/doctor-profile-manaement/doctor-profile-manaement';

export const routes: Routes = [
    { path: '', redirectTo: '/doctor/login', pathMatch: 'full' },
    { path: 'doctor/login',component: LoginComponent},
    {path: 'doctor/dashboard', component: DashboardComponent},
    { path: 'doctor/profile', component: DoctorProfileManaement }
];
