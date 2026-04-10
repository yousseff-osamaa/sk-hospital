import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DoctorService, Doctor } from '../../services/doctor.service';

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
        name: '',
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

    constructor(private route: ActivatedRoute, private doctorService: DoctorService) {}

    ngOnInit() {
        this.doctors = this.doctorService.getDoctors();
        // Pre-fill if logged in to portal
        const usr = localStorage.getItem('currentUser');
        if (usr) {
            const currentUser = JSON.parse(usr);
            this.bookingData.name = currentUser.name;
            this.bookingData.phone = currentUser.phone;
        }

        this.route.queryParams.subscribe(params => {
            const drName = params['doctor'];
            if (drName) {
                let found = this.doctors.find(d => d.name === drName);
                if (found) {
                    this.selectedDoctor = found;
                } else {
                    // Inject the custom doctor dynamically if not in original dummy list
                    const customDr: Doctor = {
                        id: Date.now(),
                        name: drName,
                        specialty: 'طبيب بمستشفى سعاد كفافي',
                        bio: '',
                        image: '',
                        schedule: 'متاح بالطلب',
                        available: true,
                        nextSlot: 'الآن',
                        queueLength: Math.floor(Math.random() * 5)
                    };
                    this.doctors.unshift(customDr);
                    this.selectedDoctor = customDr;
                }
            }
        });
    }

    selectDoctor(doctor: Doctor) {
        this.selectedDoctor = doctor;
    }

    handleSubmit(event: Event) {
        event.preventDefault();
        if (!this.selectedDoctor) return;

        this.ref = 'SKH-' + Math.floor(1000 + Math.random() * 9000).toString();
        this.queuePosition = this.selectedDoctor.queueLength + 1;
        this.bookingState = 'confirmation';
        this.reinitIcons();
    }

    submitPayment(event: Event) {
        event.preventDefault();
        
        // Save to local storage for Patient Portal access
        const appointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
        appointments.push({
            id: this.ref,
            doctorName: this.selectedDoctor?.name,
            specialty: this.selectedDoctor?.specialty,
            patientName: this.bookingData.name,
            patientPhone: this.bookingData.phone,
            date: this.bookingData.date || new Date().toLocaleDateString(),
            reason: this.bookingData.reason,
            status: 'Confirmed',
            paymentStatus: 'Paid'
        });
        localStorage.setItem('patientAppointments', JSON.stringify(appointments));

        // Payment success
        this.bookingState = 'success';
        this.reinitIcons();
    }

    resetForm() {
        this.bookingState = 'form';
        this.selectedDoctor = null;
        this.bookingData = { name: '', phone: '', date: '', reason: '' };
        this.paymentData = { cardName: '', cardNumber: '', expiry: '', cvv: '' };
        this.reinitIcons();
    }

    private reinitIcons() {
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 100);
    }
}
