import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap } from 'rxjs/operators';
import { DoctorService, Doctor } from '../../services/doctor.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';


declare var lucide: any;

@Component({
    
    selector: 'app-appointment',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './appointment.component.html',
    styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements OnInit {
    
    doctors: Doctor[] = [];
    selectedDoctor: Doctor | null = null;

    // booking states: form → confirmation → success
    bookingState: 'form' | 'confirmation' | 'success' = 'form';

    ref = '';
    queuePosition = 0;
    isDropdownOpen = false;
    isSubmitting = false;

    // ── Doctor filter state ──
    specialtyFilter = '';
    doctorSearch = '';

    get uniqueSpecialties(): string[] {
        const s = new Set(this.doctors.map(d => d.specialty).filter(Boolean));
        return Array.from(s).sort();
    }

    get filteredDoctors(): Doctor[] {
        return this.doctors.filter(d => {
            const matchSpec = !this.specialtyFilter || d.specialty === this.specialtyFilter;
            const matchSearch = !this.doctorSearch ||
                d.name.toLowerCase().includes(this.doctorSearch.toLowerCase()) ||
                (d.specialty ?? '').toLowerCase().includes(this.doctorSearch.toLowerCase());
            return matchSpec && matchSearch;
        });
    }

    bookingData = {
        firstName: '',
        lastName: '',
        phone: '',
        date: '',
        reason: ''
    };

    constructor(
        
        private route: ActivatedRoute,
        private doctorService: DoctorService,
        private http: HttpClient,
        private cdr: ChangeDetectorRef,
        private router: Router
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
                this.cdr.detectChanges();
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

        this.ref = 'SKH-' + Math.floor(1000 + Math.random() * 9000).toString();
        this.queuePosition = (this.selectedDoctor?.queueLength ?? 0) + 1;
        this.bookingState = 'confirmation';
        this.reinitIcons();
    }

confirmBooking() {
    
    if (this.isSubmitting || !this.selectedDoctor) return;
    this.isSubmitting = true;

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

    this.http.post(`${environment.apiUrl}/appointments/create/`, payload)
        .subscribe({
            next: () => {

                this.isSubmitting = false;
                this.bookingState = 'success';

                // 🔥 مهم جدًا: بعد 1.5 ثانية نرجع للـ portal
                setTimeout(() => {
                    this.router.navigate(['/portal'], {
                        queryParams: { refresh: Date.now() }
                    });
                }, 1500);

                this.reinitIcons();
            },
            error: (err) => {
                console.error(err);
                this.isSubmitting = false;
                alert('حدث خطأ أثناء الحجز');
            }
        });
}

    private afterBookingSaved() {
        // بدلاً من إضافة الموعد يدوياً، يفضل في صفحة Portal عمل Get للمواعيد من السيرفر مباشرة
        // لضمان أنه في حال حذف الأدمن للموعد، يختفي من عند المستخدم.
        this.bookingState = 'success';
        this.isSubmitting = false;
        this.reinitIcons();
    }

    resetForm() {
        this.bookingState = 'form';
        this.selectedDoctor = null;
        this.bookingData = { firstName: '', lastName: '', phone: '', date: '', reason: '' };
        this.isSubmitting = false;
        this.reinitIcons();
    }

    getPatientFullName(): string {
        return `${this.bookingData.firstName} ${this.bookingData.lastName}`.trim();
    }

    private reinitIcons() {
        setTimeout(() => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 100);
    }
}