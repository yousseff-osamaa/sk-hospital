import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

declare var lucide: any;

@Component({
    selector: 'app-portal',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './portal.component.html',
    styleUrls: ['./portal.component.scss']
})
export class PatientPortalComponent implements OnInit, AfterViewInit {

    constructor(private authService: AuthService, private router: Router, private zone: NgZone, private http: HttpClient) {}

    private readonly apiBase = environment.apiUrl;

    viewState: 'login' | 'register' | 'activation' | 'dashboard' = 'login';
    loginTab: 'patient' | 'admin' = 'patient';

    // ================= AUTH =================
    regFirstName: string = '';
    regLastName: string = '';
    regEmail: string = ''
    regPhone: string = '';
    regPassword: string = '';

    // Single full-name login field
    loginFullName = '';
    loginPassword = '';

    adminUsername = '';
    adminPassword = '';
    adminLoginError = '';

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

    // ================= POPUP / TOAST =================
    toasts: { id: number; msg: string; type: 'success'|'error'|'warning'; icon: string }[] = [];
    private toastCounter = 0;

    confirmVisible = false;
    confirmMessage = '';
    private confirmResolve: ((v: boolean) => void) | null = null;

    // =====================================================

    ngOnInit() {
        const usr = localStorage.getItem('currentUser');
        if (usr) {
            const parsedUser = JSON.parse(usr);
            // Admin users have a `username` field — send them straight to /admin
            if (parsedUser?.username) {
                this.router.navigate(['/admin']);
                return;
            }
            this.currentUser = parsedUser;
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
        // Smooth scroll to the content area after Angular renders the tab
        setTimeout(() => {
            const el = document.getElementById('portal-main');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 300, behavior: 'smooth' });
            }
            if (lucide) lucide.createIcons();
        }, 60);
    }

    ngAfterViewInit() {
        setTimeout(() => { if (lucide) lucide.createIcons(); }, 100);
    }

    // ================= AUTH =================
    goToRegister() { this.viewState = 'register'; }
    goToLogin() { this.viewState = 'login'; this.loginTab = 'patient'; }

    loginAdmin() {
        this.adminLoginError = '';
        if (this.adminUsername === 'admin' && this.adminPassword === 'admin123') {
            // Admin state lives ONLY in sessionStorage — never write to localStorage
            // so the patient portal can't mistake the admin for a logged-in patient
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            this.router.navigate(['/admin']);
        } else {
            this.adminLoginError = 'Invalid username or password';
        }
    }

    private readProfiles(): any[] {
        return JSON.parse(localStorage.getItem('portalProfiles') || '[]');
    }

    private upsertProfile(profile: { firstName: string; lastName: string; email: string; phone: string }) {
        const profiles = this.readProfiles();
        const first = profile.firstName.trim().toLowerCase();
        const last = profile.lastName.trim().toLowerCase();
        const idx = profiles.findIndex(
            (p: any) =>
                (p.firstName ?? '').trim().toLowerCase() === first &&
                (p.lastName ?? '').trim().toLowerCase() === last
        );
        if (idx > -1) {
            profiles[idx] = { ...profiles[idx], ...profile };
        } else {
            profiles.push(profile);
        }
        localStorage.setItem('portalProfiles', JSON.stringify(profiles));
    }

    register() {
        const first = this.regFirstName?.trim() ?? '';
        const last = this.regLastName?.trim() ?? '';
        const email = this.regEmail?.trim() ?? '';
        const phone = this.regPhone?.trim() ?? '';
        const password = this.regPassword ?? '';

        if (!first || !last || !email || !phone || !password) {
            this.showToast('First name, last name, email, phone number, and password are required.', 'warning');
            return;
        }

        this.authService.register({
            email,
            password,
            first_name: first,
            last_name: last,
            phone,
            redirect_url: `${window.location.origin}/verify-email`,
        }).subscribe({
            next: () => {
                this.upsertProfile({
                    firstName: first,
                    lastName: last,
                    email,
                    phone
                });
                this.showToast('Account created! Check your email to verify, then log in.', 'success');
                this.viewState = 'login';
            },
            error: (err) => {
                const e = err.error;
                const msg =
                    e?.email?.[0] ||
                    e?.phone?.[0] ||
                    e?.password?.[0] ||
                    e?.detail ||
                    (typeof e === 'string' ? e : null) ||
                    'Registration failed. Please try again.';
                this.showToast(msg, 'error');
            }
        });
    }

    login() {
        // Parse full name: "First Last" split by first space
        const full = this.loginFullName.trim();
        if (!full || !this.loginPassword) {
            this.showToast('Please enter your full name and password.', 'warning');
            return;
        }
        const spaceIdx = full.indexOf(' ');
        const first = spaceIdx > -1 ? full.substring(0, spaceIdx).toLowerCase() : full.toLowerCase();
        const last = spaceIdx > -1 ? full.substring(spaceIdx + 1).trim().toLowerCase() : '';

        const profile = this.readProfiles().find(
            (p: any) =>
                (p.firstName ?? '').trim().toLowerCase() === first &&
                (last ? (p.lastName ?? '').trim().toLowerCase() === last : true)
        );
        if (!profile?.email) {
            this.showToast('Account not found. Please register first.', 'error');
            return;
        }

        this.authService.login(profile.email, this.loginPassword).subscribe({
            next: (tokens) => {
                const userData = {
                    name: `${profile.firstName} ${profile.lastName}`.trim(),
                    email: profile.email,
                    phone: profile.phone ?? '',
                };
                this.authService.saveSession(tokens, userData);
                this.currentUser = userData;
                this.viewState = 'dashboard';
                this.loadPatientData();
            },
            error: () => this.showToast('Invalid name or password.', 'error')
        });
    }

    logout() {
        this.authService.clearSession();
        this.currentUser = null;
        this.viewState = 'login';
    }

    cancelAppointment(appt: any) {
        this.showConfirm('Cancel this appointment?').then(ok => {
            this.zone.run(() => {
                if (!ok) return;
                const all = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
                localStorage.setItem('patientAppointments', JSON.stringify(all.filter((a: any) => a.id !== appt.id)));
                this.myAppointments = this.myAppointments.filter((a: any) => a.id !== appt.id);
                this.showToast('Appointment cancelled.', 'success');
            });
        });
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
        this.showToast('Insurance ID uploaded successfully.', 'success');
    }

    // ================= CHRONIC =================
    onChronicFileSelect(event: any) {
        this.chronic.files = Array.from(event.target.files);
    }

    submitChronicRequest() {
        if (this.chronic.files.length === 0) {
            this.showToast('Please upload the required documents.', 'warning');
            return;
        }
        if (!this.currentUser?.email) {
            this.showToast('Please log in first.', 'error');
            return;
        }

        const form = new FormData();
        form.append('patient_name',  this.currentUser.name  ?? '');
        form.append('patient_email', this.currentUser.email ?? '');
        form.append('patient_phone', this.currentUser.phone ?? '');
        form.append('med_name',      this.chronic.medName   ?? '');
        form.append('condition',     this.chronic.condition ?? '');
        form.append('doctor',        this.chronic.doctor    ?? '');
        form.append('duration',      this.chronic.duration  ?? '');

        this.chronic.files.forEach((f: File) => form.append('files', f, f.name));

        // Try backend first; fall back to localStorage on network error
        this.http.post(`${this.apiBase}/chronic/submit/`, form).subscribe({
            next: (saved: any) => {
                // Refresh local list from backend response
                const all = JSON.parse(localStorage.getItem('chronicRequests') || '[]');
                all.push(saved);
                localStorage.setItem('chronicRequests', JSON.stringify(all));
                this.chronicRequests.push(saved);
                this.isSubmitted = true;
                this.chronic = { medName: '', condition: '', doctor: '', duration: '', files: [] };
            },
            error: () => {
                // Offline fallback: store names only
                const newRequest = {
                    id: Date.now(),
                    patientName: this.currentUser.name,
                    patientEmail: this.currentUser.email,
                    medName: this.chronic.medName || 'Chronic Med',
                    condition: this.chronic.condition || 'General',
                    doctor: this.chronic.doctor,
                    duration: this.chronic.duration,
                    files: this.chronic.files.map((f: File) => f.name),
                    status: 'Pending',
                    date: new Date().toLocaleDateString()
                };
                const all = JSON.parse(localStorage.getItem('chronicRequests') || '[]');
                all.push(newRequest);
                localStorage.setItem('chronicRequests', JSON.stringify(all));
                this.chronicRequests.push(newRequest);
                this.isSubmitted = true;
                this.chronic = { medName: '', condition: '', doctor: '', duration: '', files: [] };
            }
        });
    }

    activate() {
        if (this.actCode === this.generatedCode || this.actCode === '1234') {
            this.showToast('Account activated! You can now log in.', 'success');
            this.viewState = 'login';
        } else {
            this.showToast('Wrong activation code. Please try again.', 'error');
        }
    }

    // ================= TOAST SYSTEM =================
    showToast(msg: string, type: 'success'|'error'|'warning' = 'success') {
        const id = ++this.toastCounter;
        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '!';
        this.toasts.push({ id, msg, type, icon });
        setTimeout(() => this.dismissToast(id), 4500);
    }

    dismissToast(id: number) {
        this.toasts = this.toasts.filter(t => t.id !== id);
    }

    // ================= CONFIRM DIALOG =================
    showConfirm(message: string): Promise<boolean> {
        this.confirmMessage = message;
        this.confirmVisible = true;
        return new Promise(resolve => {
            this.confirmResolve = resolve;
        });
    }

    onConfirmYes() {
        this.confirmVisible = false;
        this.confirmResolve?.(true);
        this.confirmResolve = null;
    }

    onConfirmNo() {
        this.confirmVisible = false;
        this.confirmResolve?.(false);
        this.confirmResolve = null;
    }
}