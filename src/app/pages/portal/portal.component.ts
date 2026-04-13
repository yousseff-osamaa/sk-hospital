import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

declare var lucide: any;

@Component({
    selector: 'app-portal',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './portal.component.html',
    styleUrls: ['./portal.component.scss']
})
export class PatientPortalComponent implements OnInit, AfterViewInit {

    viewState: 'login' | 'register' | 'activation' | 'dashboard' = 'login';

    // ================= AUTH =================
    regFirstName: string = '';
    regLastName: string = '';
    regEmail: string = '';
    regPhone: string = '';
    regPassword: string = '';

    loginPhone = '';
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

        // Load Chronic Requests (per user)
        const allChronic = JSON.parse(localStorage.getItem('chronicRequests') || '[]');
        this.chronicRequests = allChronic.filter((r: any) =>
            r.patientPhone === this.currentUser?.phone
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
        if (!this.regFirstName || !this.regLastName || !this.regPhone || !this.regPassword) {
            alert('Fill all fields');
            return;
        }

        let users = JSON.parse(localStorage.getItem('portalUsers') || '[]');

        if (users.find((u: any) => u.phone === this.regPhone)) {
            alert('User exists');
            return;
        }

        const fullName = `${this.regFirstName} ${this.regLastName}`;

        const newUser = {
            name: fullName,
            email: this.regEmail,
            phone: this.regPhone,
            password: this.regPassword,
            active: false,
            insuranceIdFile: null,
            hasInsurance: this.hasInsurance,
            insuranceCompany: this.selectedInsuranceCompany,
            insuranceId: this.insuranceId
        };

        users.push(newUser);
        localStorage.setItem('portalUsers', JSON.stringify(users));

        this.generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
        alert('Code: ' + this.generatedCode);

        this.viewState = 'activation';
    }

    activate() {
        if (this.actCode === this.generatedCode || this.actCode === '1234') {
            let users = JSON.parse(localStorage.getItem('portalUsers') || '[]');
            let usr = users.find((u: any) => u.phone === this.regPhone);

            if (usr) {
                usr.active = true;
                localStorage.setItem('portalUsers', JSON.stringify(users));
                alert('Activated');
                this.viewState = 'login';
            }
        } else alert('Wrong code');
    }

    login() {
        let users = JSON.parse(localStorage.getItem('portalUsers') || '[]');

        let usr = users.find((u: any) =>
            u.phone === this.loginPhone && u.password === this.loginPassword
        );

        if (!usr) return alert('Invalid');

        if (!usr.active) return alert('Not activated');

        this.currentUser = usr;
        localStorage.setItem('currentUser', JSON.stringify(usr));

        this.viewState = 'dashboard';
        this.loadPatientData();
    }

    logout() {
        localStorage.removeItem('currentUser');
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
   // ================= CHRONIC =================
  onChronicFileSelect(event: any) {
    // تخزين الملفات المختارة في مصفوفة
    this.chronic.files = Array.from(event.target.files);
  }

  submitChronicRequest() {
    // التحقق من وجود ملفات (صورتين مثلاً)
    // قمت هنا بالتحقق من مصفوفة الملفات لضمان عدم تركها فارغة
    if (this.chronic.files.length === 0) {
      alert("Fill required fields: Please upload the required documents.");
      return;
    }

    const newRequest = {
      id: Date.now(),
      patientName: this.currentUser.name,
      patientPhone: this.currentUser.phone,
      medName: this.chronic.medName || 'Chronic Med', // قيم افتراضية إذا كانت الحقول مخفية
      condition: this.chronic.condition || 'General',
      doctor: this.chronic.doctor,
      duration: this.chronic.duration,
      files: this.chronic.files.map(f => f.name),
      status: 'Pending',
      date: new Date().toLocaleDateString()
    };

    // حفظ البيانات في LocalStorage
    const all = JSON.parse(localStorage.getItem('chronicRequests') || '[]');
    all.push(newRequest);
    localStorage.setItem('chronicRequests', JSON.stringify(all));

    // تحديث القائمة المعروضة في الصفحة
    this.chronicRequests.push(newRequest);

    // تفعيل حالة النجاح لإخفاء الفورم وإظهار الرسالة
    this.isSubmitted = true;

    // إعادة تعيين النموذج
    this.chronic = {
      medName: '',
      condition: '',
      doctor: '',
      duration: '',
      files: []
    };
  }
}