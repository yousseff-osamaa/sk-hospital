import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare var lucide: any;

@Component({
    selector: 'app-portal',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './portal.component.html',
    styleUrls: ['./portal.component.scss']
})
export class PatientPortalComponent implements OnInit, AfterViewInit {

    constructor(private authService: AuthService) {}

    viewState: 'login' | 'register' | 'activation' | 'dashboard' = 'login';

    // ================= AUTH =================
    regFirstName: string = '';
    regLastName: string = '';
    regEmail: string = '';
    regPhone: string = '';
    regPassword: string = '';

    loginEmail = '';
    loginPassword = '';

    currentUser: any = null;

    // ================= INSURANCE =================
    hasInsurance: boolean = false;
    selectedInsuranceCompany: string = '';
    insuranceId: string = '';

    insuranceCompanies: string[] = [
        'Egycare Healthcare',
        'MedNet Egypt',
        'Nextcare',
        'GlobeMed Egypt',
        'Neuron Egypt',
        'Care Plus',
        'Med Right',
        'Med Sure',
        'Unicare Egypt',
        'Misr Healthcare Network',
        'Al Ahly Medical Company',
        'Limitless Care'
    ];

    // ================= ACTIVATION =================
    actCode = '';
    generatedCode = '';

    // ================= DASHBOARD =================
    activeTab: 'dashboard' | 'appointments' | 'labs' | 'imaging' | 'chronic' = 'dashboard';

    insuranceFile: any = null;
    uploadSuccess = false;

    myAppointments: any[] = [];
    labResults: any[] = [];
    imagingRecords: any[] = [];

    // ================= CHRONIC MEDICATION =================
    chronic = {
        medName: '',
        condition: '',
        doctor: '',
        duration: '',
        files: [] as File[]
    };

    chronicRequests: any[] = [];
    loginSubmitted: any;
    regSubmitted: any;
    isSubmitted: any;

    // =====================================================

    ngOnInit() {
        const usr = localStorage.getItem('currentUser');
        if (usr) {
            this.currentUser = JSON.parse(usr);
            this.viewState = 'dashboard';
            this.loadPatientData();
        }

        const allChronic = JSON.parse(localStorage.getItem('chronicRequests') || '[]');
        this.chronicRequests = allChronic.filter((r: any) =>
            r.patientEmail === this.currentUser?.email
        );
    }

    loadPatientData() {
        if (!this.currentUser) return;

        const allAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
        this.myAppointments = allAppointments.filter((a: any) => a.patientPhone === this.currentUser.phone);

        this.labResults = [
            { date: '2026-03-15', name: 'CBC', result: 'Normal', status: 'Final' },
            { date: '2026-03-15', name: 'Lipid Profile', result: 'High Cholesterol', status: 'Final' }
        ];

        this.imagingRecords = [
            { date: '2026-03-12', type: 'Chest X-Ray', findings: 'Normal', id: 'XR-7721' }
        ];

        if (this.currentUser.insuranceIdFile) {
            this.insuranceFile = this.currentUser.insuranceIdFile;
            this.uploadSuccess = true;
        }

        setTimeout(() => { if (lucide) lucide.createIcons(); }, 100);
    }

    setActiveTab(tab: any) {
        this.activeTab = tab;
        setTimeout(() => { if (lucide) lucide.createIcons(); }, 50);
    }

    ngAfterViewInit() {
        setTimeout(() => { if (lucide) lucide.createIcons(); }, 100);
    }

    // ================= AUTH =================
    goToRegister() { this.viewState = 'register'; }
    goToLogin() { this.viewState = 'login'; }

    register() {
        if (!this.regFirstName || !this.regLastName || !this.regEmail || !this.regPassword) {
            alert('Please fill all required fields');
            return;
        }

        this.authService.register({
            email: this.regEmail,
            password: this.regPassword,
            first_name: this.regFirstName,
            last_name: this.regLastName,
        }).subscribe({
            next: () => {
                alert('Account created! You can now log in.');
                this.viewState = 'login';
            },
            error: (err) => {
                const msg = err.error?.email?.[0] || err.error?.detail || 'Registration failed. Please try again.';
                alert(msg);
            }
        });
    }

    login() {
        if (!this.loginEmail || !this.loginPassword) {
            alert('Please fill all fields');
            return;
        }

        this.authService.login(this.loginEmail, this.loginPassword).subscribe({
            next: (tokens) => {
                const userData = {
                    name: this.loginEmail,
                    email: this.loginEmail,
                    phone: this.loginEmail,
                };
                this.authService.saveSession(tokens, userData);
                this.currentUser = userData;
                this.viewState = 'dashboard';
                this.loadPatientData();
            },
            error: () => alert('Invalid email or password')
        });
    }

    logout() {
        this.authService.clearSession();
        this.currentUser = null;
        this.viewState = 'login';
    }

    // ================= INSURANCE =================
    onFileSelect(event: any) {
        if (event.target.files.length > 0) {
            this.insuranceFile = event.target.files[0].name;
            this.uploadSuccess = false;
        }
    }

    submitRequest() {
        this.currentUser.insuranceIdFile = this.insuranceFile;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.uploadSuccess = true;
        alert('Insurance uploaded');
    }

    // ================= CHRONIC =================
    onChronicFileSelect(event: any) {
        this.chronic.files = Array.from(event.target.files);
    }

    submitChronicRequest() {
        if (this.chronic.files.length === 0) {
            alert('Please upload the required documents.');
            return;
        }

        const newRequest = {
            id: Date.now(),
            patientName: this.currentUser.name,
            patientEmail: this.currentUser.email,
            medName: this.chronic.medName || 'Chronic Med',
            condition: this.chronic.condition || 'General',
            doctor: this.chronic.doctor,
            duration: this.chronic.duration,
            files: this.chronic.files.map(f => f.name),
            status: 'Pending',
            date: new Date().toLocaleDateString()
        };

        const all = JSON.parse(localStorage.getItem('chronicRequests') || '[]');
        all.push(newRequest);
        localStorage.setItem('chronicRequests', JSON.stringify(all));

        this.chronicRequests.push(newRequest);
        this.isSubmitted = true;

        this.chronic = {
            medName: '',
            condition: '',
            doctor: '',
            duration: '',
            files: []
        };
    }

    activate() {
        if (this.actCode === this.generatedCode || this.actCode === '1234') {
            alert('Activated');
            this.viewState = 'login';
        } else {
            alert('Wrong code');
        }
    }
}