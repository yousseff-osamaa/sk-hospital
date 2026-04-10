import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService, Doctor } from '../../services/doctor.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styles: `
    .badge-green { background: #d1fae5; color: #00734c; }
    .badge-orange { background: #fef3c7; color: #b45309; }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-danger { background: #fee2e2; color: #b91c1c; }
    .btn-danger { background: #dc2626; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; transition: 0.2s;}
    .btn-danger:hover { background: #b91c1c; }
    .btn-edit { background: #eab308; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; transition: 0.2s;}
    .btn-edit:hover { background: #ca8a04; }
    .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-content { background: white; padding: 2rem; border-radius: 12px; width: 500px; max-width: 90%; max-height: 90vh; overflow-y: auto; }
    .form-group { margin-bottom: 1rem; text-align: left; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #333;}
    .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-family: inherit;}
    .admin-grid { display: grid; grid-template-columns: 1fr; gap: 3rem; }
  `
})
export class Admin implements OnInit {
    patientRequests: any[] = [];
    contactMessages: any[] = [];
    patientAppointments: any[] = [];
    doctors: Doctor[] = [];

    // Modal states
    showDoctorModal = false;
    currentDoctor: Partial<Doctor> = {};
    
    showAppointmentModal = false;
    isEditingAppointment = false;
    currentAppointment: any = {};

    // Auth states
    isAdminLoggedIn = false;
    loginData = { username: '', password: '' };
    loginError = '';

    constructor(private doctorService: DoctorService) {}

    ngOnInit() {
        // Check if already logged in this session
        const sessionAuth = sessionStorage.getItem('isAdminLoggedIn');
        if (sessionAuth === 'true') {
            this.isAdminLoggedIn = true;
        }
        this.loadData();
    }

    login() {
        // Default credentials as requested
        if (this.loginData.username === 'admin' && this.loginData.password === 'admin123') {
            this.isAdminLoggedIn = true;
            this.loginError = '';
            sessionStorage.setItem('isAdminLoggedIn', 'true');
        } else {
            this.loginError = 'Invalid username or password';
        }
    }

    logout() {
        this.isAdminLoggedIn = false;
        sessionStorage.removeItem('isAdminLoggedIn');
        this.loginData = { username: '', password: '' };
    }

    loadData() {
        this.patientRequests = JSON.parse(localStorage.getItem('portalRequests') || '[]');
        this.contactMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        this.patientAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
        this.doctors = this.doctorService.getDoctors();
    }

    // Portal ID Approvals
    approve(req: any) {
        req.status = 'Approved';
        this.saveRequests();
    }

    processPayment(req: any) {
        req.status = 'Completed';
        this.saveRequests();
        alert('Payment processed successfully for ' + req.patientName);
    }

    saveRequests() {
        localStorage.setItem('portalRequests', JSON.stringify(this.patientRequests));
    }

    saveAppointments() {
        localStorage.setItem('patientAppointments', JSON.stringify(this.patientAppointments));
    }

    // Doctor Management
    openDoctorModal(doctor?: Doctor) {
        if (doctor) {
            this.currentDoctor = { ...doctor };
        } else {
            this.currentDoctor = { name: '', specialty: '', bio: '', image: '', schedule: '', available: true, nextSlot: 'الآن', queueLength: 0 };
        }
        this.showDoctorModal = true;
    }

    saveDoctor() {
        if (this.currentDoctor.id) {
            this.doctorService.updateDoctor(this.currentDoctor as Doctor);
        } else {
            this.doctorService.addDoctor(this.currentDoctor as Omit<Doctor, 'id'>);
        }
        this.doctors = this.doctorService.getDoctors();
        this.showDoctorModal = false;
    }

    deleteDoctor(id: number) {
        if (confirm('Are you sure you want to delete this doctor?')) {
            this.doctorService.deleteDoctor(id);
            this.doctors = this.doctorService.getDoctors();
        }
    }

    // Appointment Management
    openAppointmentModal(appointment?: any) {
        if (appointment) {
            this.currentAppointment = { ...appointment };
            this.isEditingAppointment = true;
        } else {
            this.currentAppointment = { id: 'SKH-' + Math.floor(Math.random()*9000+1000), patientName: '', doctorName: '', date: '', status: 'Pending' };
            this.isEditingAppointment = false;
        }
        this.showAppointmentModal = true;
    }

    saveAppointment() {
        const index = this.patientAppointments.findIndex(a => a.id === this.currentAppointment.id);
        if (index > -1) {
            this.patientAppointments[index] = this.currentAppointment;
        } else {
            this.patientAppointments.unshift(this.currentAppointment);
        }
        this.saveAppointments();
        this.showAppointmentModal = false;
    }

    deleteAppointment(id: string) {
        if (confirm('Are you sure you want to delete this appointment?')) {
            this.patientAppointments = this.patientAppointments.filter(a => a.id !== id);
            this.saveAppointments();
        }
    }
}
