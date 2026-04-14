import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap } from 'rxjs/operators';
import { DoctorService, Doctor } from '../../services/doctor.service';
import { environment } from '../../../environments/environment';

declare var lucide: any;



@Component({
    selector: 'app-appointment',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './appointment.component.html',
    styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements OnInit {
    doctors: Doctor[] = [];

    selectedDoctor: Doctor | null = null;
    
    // booking states: form, confirmation, payment, success
    bookingState: 'form' | 'confirmation' | 'payment' | 'success' = 'form';
    
    ref = '';
    queuePosition = 0;
    isDropdownOpen = false;

    bookingData = {
        firstName: '',
        lastName: '',
        phone: '',
        date: '',
        reason: ''
    };
    
    paymentData = {
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    };

    constructor(
        private route: ActivatedRoute,
        private doctorService: DoctorService,
        private http: HttpClient
    ) {}

    ngOnInit() {
        const usr = localStorage.getItem('currentUser');
        if (usr) {
            const currentUser = JSON.parse(usr);
            const fullName = (currentUser.name ?? '').trim();
            const parts = fullName.split(/\s+/).filter((p: string) => p.length > 0);
            this.bookingData.firstName = parts[0] ?? '';
            this.bookingData.lastName = parts.slice(1).join(' ');
            this.bookingData.phone = currentUser.phone;
        }

        this.doctorService.getDoctorsFromApi().pipe(
            tap((doctors) => {
                this.doctors = doctors.length ? doctors : this.doctorService.getDoctors();
            }),
            switchMap(() => this.route.queryParams)
        ).subscribe((params) => {
            const drName = params['doctor'];
            if (!drName) return;
            const found = this.doctors.find((d) => d.name === drName);
            if (found) {
                this.selectedDoctor = found;
            } else {
                const customDr: Doctor = {
                    id: Date.now(),
                    name: drName,
                    specialty: 'طبيب بمستشفى سعاد كفافي',
                    bio: '',
                    image: '',
                    schedule: 'متاح بالطلب',
                    available: true,
                    next_slot: 'الآن',
                    queue_length: 0,
                    nextSlot: 'الآن',
                    queueLength: 0
                };
                this.doctors.unshift(customDr);
                this.selectedDoctor = customDr;
            }
        });
    }

    selectDoctor(doctor: Doctor) {
        this.selectedDoctor = doctor;
    }

    handleSubmit(event: Event) {
        event.preventDefault();
        if (!this.selectedDoctor) return;
        if (!this.bookingData.firstName.trim() || !this.bookingData.lastName.trim()) return;

        this.ref = 'SKH-' + Math.floor(1000 + Math.random() * 9000).toString();
        this.queuePosition = (this.selectedDoctor?.queueLength ?? 0) + 1;
        this.bookingState = 'confirmation';
        this.reinitIcons();
    }

    submitPayment(event: Event) {
        event.preventDefault();
        if (!this.selectedDoctor) return;

        const dateStr = this.bookingData.date || new Date().toISOString().slice(0, 10);
        const patientName = this.getPatientFullName();
        const payload = {
            doctorName: this.selectedDoctor.name,
            patientName,
            patientPhone: this.bookingData.phone,
            date: dateStr,
            id: this.ref,
            reason: this.bookingData.reason || ''
        };

        this.http.post<{ message?: string }>(`${environment.apiUrl}/appointments/create/`, payload).subscribe({
            next: () => this.afterBookingSaved(),
            error: () => {
                this.afterBookingSaved();
                console.warn('Appointment API unavailable; saved locally only.');
            }
        });
    }

    private afterBookingSaved() {
        const appointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
        appointments.push({
            id: this.ref,
            doctorName: this.selectedDoctor?.name,
            specialty: this.selectedDoctor?.specialty,
            patientName: this.getPatientFullName(),
            patientPhone: this.bookingData.phone,
            date: this.bookingData.date || new Date().toLocaleDateString(),
            reason: this.bookingData.reason,
            status: 'Confirmed',
            paymentStatus: 'Paid'
        });
        localStorage.setItem('patientAppointments', JSON.stringify(appointments));
        this.bookingState = 'success';
        this.reinitIcons();
    }

    resetForm() {
        this.bookingState = 'form';
        this.selectedDoctor = null;
        this.bookingData = { firstName: '', lastName: '', phone: '', date: '', reason: '' };
        this.paymentData = { cardName: '', cardNumber: '', expiry: '', cvv: '' };
        this.reinitIcons();
    }

    getPatientFullName(): string {
        return `${this.bookingData.firstName} ${this.bookingData.lastName}`.trim();
    }

    private reinitIcons() {
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 100);
    }
}
