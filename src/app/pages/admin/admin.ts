import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorService, Doctor } from '../../services/doctor.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventsService } from '../../services/events.service';
import { ScheduleSlide } from '../schedules/schedules.component';
import { HospitalEvent } from '../events/events.component';

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
    .modal-content { background: white; padding: 2rem; border-radius: 12px; width: 520px; max-width: 90%; max-height: 90vh; overflow-y: auto; }
.form-group { margin-bottom: 1rem; text-align: left; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #333;}
    .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-family: inherit;}
    .admin-grid { display: grid; grid-template-columns: 1fr; gap: 3rem; }

    /* Toast popup */
    .toast-container { position: fixed; top: 1.5rem; right: 1.5rem; z-index: 9999; display: flex; flex-direction: column; gap: 0.75rem; }
    .toast { display: flex; align-items: center; gap: 12px; background: white; border-radius: 10px; padding: 1rem 1.25rem; min-width: 280px; max-width: 400px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12); border-left: 4px solid #00a76f; animation: slideIn 0.3s ease; }
    .toast.error { border-left-color: #dc2626; }
    .toast.warning { border-left-color: #f59e0b; }
    .toast-icon { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.8rem; font-weight: 700; }
    .toast-icon.success { background: #d1fae5; color: #00734c; }
    .toast-icon.error { background: #fee2e2; color: #b91c1c; }
    .toast-icon.warning { background: #fef3c7; color: #b45309; }
    .toast-msg { font-size: 0.88rem; color: #333; font-weight: 500; flex: 1; line-height: 1.4; }
    .toast-close { background: none; border: none; color: #999; cursor: pointer; font-size: 1rem; padding: 0; flex-shrink: 0; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    /* Confirm dialog */
    .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; justify-content: center; align-items: center; z-index: 1100; }
    .confirm-box { background: white; border-radius: 14px; padding: 2rem; width: 360px; max-width: 90%; box-shadow: 0 16px 40px rgba(0,0,0,0.15); text-align: center; }
    .confirm-box h3 { margin: 0 0 0.75rem; color: #1e293b; font-size: 1.1rem; }
    .confirm-box p { margin: 0 0 1.5rem; color: #64748b; font-size: 0.92rem; line-height: 1.5; }
    .confirm-actions { display: flex; justify-content: center; gap: 1rem; }

    /* Doctor search filter */
    .filter-bar { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
    .filter-bar input, .filter-bar select { padding: 0.5rem 0.85rem; border: 1px solid #ddd; border-radius: 8px; font-family: inherit; font-size: 0.9rem; background: white; }
    .filter-bar input { flex: 1; min-width: 160px; }

    /* Admin nav tabs */
    .admin-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2rem; }
    .admin-tab { padding: 0.55rem 1.1rem; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; background: #f1f5f9; color: #64748b; }
    .admin-tab.active { background: var(--primary, #00a76f); color: white; }
    .admin-tab:hover:not(.active) { background: #e2e8f0; }

    /* Image preview */
    .img-preview { margin-top: 0.5rem; max-height: 100px; border-radius: 8px; object-fit: cover; border: 1px solid #eee; }
    .img-upload-area { border: 2px dashed #ddd; border-radius: 8px; padding: 1rem; text-align: center; cursor: pointer; transition: border-color 0.2s; }
    .img-upload-area:hover { border-color: var(--primary, #00a76f); }
  `
})

export class Admin implements OnInit {


  patientRequests: any[] = [];
  contactMessages: any[] = [];
  patientAppointments: any[] = [];
  doctors: Doctor[] = [];
  news: any[] = [];
  eventsList: any[] = [];
  scheduleSlides: ScheduleSlide[] = [];
  showScheduleModal = false;
  currentSlide: ScheduleSlide = { src: '', alt: '' };
  editingSlideIndex = -1; // -1 = adding new
  chronicRequests: any[] = [];
  users: any[] = [];
  showUserModal = false;
  currentUser: any = {};

  // ---- Lightbox for chronic document viewer ----
  lightboxVisible = false;
  lightboxUrl = '';
  lightboxFilename = '';
  lightboxFiles: any[] = [];
  lightboxIndex = 0;

  showDoctorModal = false;
  currentDoctor: Partial<Doctor> = {};

  showAppointmentModal = false;
  isEditingAppointment = false;
  currentAppointment: any = {};

  showNewsModal = false;
  currentNews: any = {
    id: null,
    title: '',
    category: '',
    date: '',
    summary: '',
    content: '',
    image: ''
  };

  showEventModal = false;
  currentEvent: any = {};

  isAdminLoggedIn = false;
  loginData = { username: '', password: '' };
  loginError = '';
  heroSlides: string[] = [];
  showHeroModal = false;
  currentHeroImage: string = '';
  editingHeroIndex = -1;

  private readonly DEFAULT_HERO_IMAGES = [
    '/hospital-building.jpg',
    '/slider 3.jpeg',
    '/slider 4.jpeg',
    '/slider 6.jpeg'
  ];

  private readonly DEFAULT_SCHEDULE_SLIDES: ScheduleSlide[] = [
    { src: '/doc1.jpg', alt: 'جدول مواعيد عيادات الجراحة والقلب — مستشفى سُعاد كفافي الجامعي' },
    { src: '/doc2.jpg', alt: 'جدول مواعيد عيادات العظام والجلدية — مستشفى سُعاد كفافي الجامعي' },
    { src: '/doc3.jpg', alt: 'جدول مواعيد عيادات الباطنة والأطفال — مستشفى سُعاد كفافي الجامعي' },
    { src: '/doc4.jpg', alt: 'جدول مواعيد الطوارئ والخدمات العاجلة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/doc5.jpg', alt: 'جدول مواعيد العيادات التخصصية — مستشفى سُعاد كفافي الجامعي' },
    { src: '/doc6.jpg', alt: 'جدول مواعيد العيادات التخصصية — مستشفى سُعاد كفافي الجامعي' },
    { src: '/doc7.jpg', alt: 'جدول مواعيد العيادات التخصصية — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-01.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-02.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-03.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-04.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-05.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-06.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-07.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-08.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-09.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-10.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-11.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-12.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-13.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-14.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-15.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' },
    { src: '/assets/schedules/schedule-16.png', alt: 'جدول مواعيد عيادة — مستشفى سُعاد كفافي الجامعي' }
  ];

  loadHeroSlides() {
    const stored = localStorage.getItem('heroImages');
    let slides = [];
    try {
      slides = stored ? JSON.parse(stored) : [];
    } catch (e) {
      slides = [];
    }

    if (slides.length === 0) {
      this.heroSlides = [...this.DEFAULT_HERO_IMAGES];
      localStorage.setItem('heroImages', JSON.stringify(this.heroSlides));
    } else {
      this.heroSlides = slides;
    }
    this.cdr.detectChanges();
  }
  openHeroModal(image: string = '', index: number = -1) {
    this.currentHeroImage = image;
    this.editingHeroIndex = index;
    this.showHeroModal = true;
  }

  resetHeroDefaults() {
    if (confirm('Are you sure you want to reset hero images to default?')) {
      this.heroSlides = [...this.DEFAULT_HERO_IMAGES];
      localStorage.setItem('heroImages', JSON.stringify(this.heroSlides));
      this.showToast('Hero images reset!', 'success');
    }
  }

  resetScheduleDefaults() {
    if (confirm('Are you sure you want to reset schedule slides to default?')) {
      this.scheduleSlides = [...this.DEFAULT_SCHEDULE_SLIDES];
      localStorage.setItem('scheduleSlides', JSON.stringify(this.scheduleSlides));
      this.showToast('Schedules reset!', 'success');
    }
  }

  // ✅ This stays ONLY in admin.component.ts
  onHeroImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showToast('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.currentHeroImage = reader.result as string; // ✅ THIS LINE WAS MISSING
      this.cdr.detectChanges();
    };

    reader.onerror = () => this.showToast('Failed to load image', 'error');
    reader.readAsDataURL(file);
  }
  saveHeroImage() {
    if (!this.currentHeroImage) {
      this.showToast('Please upload an image', 'warning');
      return;
    }

    const all = [...this.heroSlides];

    if (this.editingHeroIndex > -1) {
      // ✏️ EDIT
      all[this.editingHeroIndex] = this.currentHeroImage;
      this.showToast('Image updated!', 'success');
    } else {
      // 🆕 ADD NEW (NEWEST FIRST)
      all.unshift(this.currentHeroImage);
      this.showToast('Image added!', 'success');
    }

    localStorage.setItem('heroImages', JSON.stringify(all));
    this.heroSlides = all;
    this.showHeroModal = false;
    this.cdr.detectChanges();
  }

  moveHeroImage(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.heroSlides.length) return;

    const arr = [...this.heroSlides];
    const temp = arr[index];
    arr[index] = arr[newIndex];
    arr[newIndex] = temp;

    this.heroSlides = arr;
    localStorage.setItem('heroImages', JSON.stringify(arr));
    this.cdr.detectChanges();
    this.showToast('Order updated!', 'success');
  }

  onNewsImageSelected(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!this.currentNews.images) this.currentNews.images = [];

    Array.from(files).forEach((file: any) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          this.currentNews.images.push(res);
          // Set first image as primary if none exists
          if (!this.currentNews.image) this.currentNews.image = res;
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  removeNewsImage(index: number) {
    if (this.currentNews.images) {
      this.currentNews.images.splice(index, 1);
      if (this.currentNews.image && !this.currentNews.images.includes(this.currentNews.image)) {
        this.currentNews.image = this.currentNews.images[0] || '';
      }
      this.cdr.detectChanges();
    }
  }

  onDoctorImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showToast('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.currentDoctor.image = reader.result as string; // base64
      this.cdr.detectChanges();
    };
    reader.onerror = () => this.showToast('Failed to load image', 'error');
    reader.readAsDataURL(file);
  }
  deleteHeroImage(index: number) {
    this.showConfirm('Delete this image?').then(ok => {
      if (!ok) return;

      const updated = this.heroSlides.filter((_, i) => i !== index);

      localStorage.setItem('heroImages', JSON.stringify(updated));

      this.heroSlides = updated;
      this.cdr.detectChanges();

      this.showToast('Deleted successfully!', 'success');
    });
  }

  // ---- Toast / Popup system ----
  toasts: { id: number; msg: string; type: 'success' | 'error' | 'warning'; icon: string }[] = [];
  private toastCounter = 0;

  // ---- Confirm dialog ----
  confirmVisible = false;
  confirmMessage = 'Are you sure?';
  private confirmResolve: ((v: boolean) => void) | null = null;

  // ---- Appointment filter ----
  apptSearchDoctor = '';
  apptFilterSpecialty = '';
  onImageSelected(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!this.currentEvent.images) this.currentEvent.images = [];

    Array.from(files).forEach((file: any) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          this.currentEvent.images.push(res);
          if (!this.currentEvent.image) this.currentEvent.image = res;
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  removeEventImage(index: number) {
    if (this.currentEvent.images) {
      this.currentEvent.images.splice(index, 1);
      if (this.currentEvent.image && !this.currentEvent.images.includes(this.currentEvent.image)) {
        this.currentEvent.image = this.currentEvent.images[0] || '';
      }
      this.cdr.detectChanges();
    }
  }

  // get specialties(): string[] {
  //   const s = new Set(this.doctors.map(d => d.specialty).filter(Boolean));
  //   return Array.from(s);
  // }
  get specialties(): string[] {
    const s = new Set(this.doctors.map(d => d.specialty).filter(Boolean));
    return Array.from(s);
  }
  get filteredDoctors(): Doctor[] {
    const q = this.apptSearchDoctor.toLowerCase();
    return this.doctors.filter(d =>
      (!q || d.name.toLowerCase().includes(q)) &&
      (!this.apptFilterSpecialty || d.specialty === this.apptFilterSpecialty)
    );
  }

  // ---- Appointments filter for table ----
  apptTableSearch = '';
  apptTableSpecialty = '';

  // ---- Appointment date filter ----
  apptDateFilter = '';

  get filteredAppointments(): any[] {
    return this.patientAppointments.filter(a => {
      const doctorMatch = !this.apptTableSearch ||
        (a.doctor_name || a.doctorName || '').toLowerCase().includes(this.apptTableSearch.toLowerCase()) ||
        (a.patient_name || a.patientName || '').toLowerCase().includes(this.apptTableSearch.toLowerCase());
      const specialtyDoc = this.doctors.find(d => d.id === a.doctor || d.name === (a.doctor_name || a.doctorName));
      const specialtyMatch = !this.apptTableSpecialty || (specialtyDoc?.specialty === this.apptTableSpecialty);
      const dateVal = a.appointment_date || a.date || '';
      const dateMatch = !this.apptDateFilter || dateVal.startsWith(this.apptDateFilter);
      return doctorMatch && specialtyMatch && dateMatch;
    });
  }

  // ---- Active admin section tab ----
  activeSection:
    | 'doctors'
    | 'appointments'
    | 'news'
    | 'events'
    | 'patients'
    | 'chronic'
    | 'contact'
    | 'schedules'
    | 'slider'
    | 'users'
    = 'doctors';

  // ---- Doctor list filter (in Doctors tab) ----
  docSearch = '';
  docFilterSpecialty = '';
  readonly SPECIALTIES = [
    'أمراض القلب والأوعية الدموية',
    'أمراض الجلدية',
    'طب الطوارئ',
    'أمراض الغدد الصماء',
    'أمراض الجهاز الهضمي',
    'الجراحة العامة',
    'أمراض النساء والتوليد',
    'أمراض الدم',
    'الطب الباطني',
    'أمراض الكلى',
    'أمراض الأعصاب',
    'جراحة المخ والأعصاب',
    'أمراض الأورام',
    'طب وجراحة العيون',
    'جراحة العظام والمفاصل',
    'أمراض الأنف والأذن والحنجرة',
    'طب الأطفال',
    'الطب النفسي',
    'أمراض الصدر والجهاز التنفسي',
    'الأشعة التشخيصية',
    'أمراض الروماتيزم',
    'جراحة المسالك البولية',
    'جراحة الأوعية الدموية',
    'طب الأسنان',
    'التغذية العلاجية',
    'العلاج الطبيعي وإعادة التأهيل'
  ];

  get uniqueSpecialties(): string[] {
    const fromDoctors = this.doctors.map(d => d.specialty).filter(Boolean);
    const merged = new Set([...this.SPECIALTIES, ...fromDoctors]);
    return Array.from(merged).sort();
  }
  get filteredDoctorList(): Doctor[] {
    return this.doctors.filter(d => {
      const matchSpec = !this.docFilterSpecialty || d.specialty === this.docFilterSpecialty;
      const matchSearch = !this.docSearch ||
        d.name.toLowerCase().includes(this.docSearch.toLowerCase()) ||
        (d.specialty ?? '').toLowerCase().includes(this.docSearch.toLowerCase());
      return matchSpec && matchSearch;
    });
  }


  private readonly apiBase = environment.apiUrl;

  // Valid statuses the backend accepts — edit this list to match your Django STATUS_CHOICES
  readonly VALID_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

  constructor(
    private doctorService: DoctorService,
    private http: HttpClient,
    private eventsService: EventsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngOnInit() {
    const sessionAuth = sessionStorage.getItem('isAdminLoggedIn');
    if (sessionAuth === 'true') {
      this.isAdminLoggedIn = true;
      setTimeout(() => this.loadData(), 0);
    }

    // ✅ Listen for patient cancellations from other tabs
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === 'adminRefreshFlag' && this.isAdminLoggedIn) {
        this.zone.run(() => {
          this.loadData();
          this.showToast('A patient cancelled an appointment.', 'warning');
        });
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['/']);
  }

  setSection(section: typeof this.activeSection) {
    this.activeSection = section;
    this.cdr.detectChanges();
    setTimeout(() => {
      const el = document.getElementById('admin-content');
      if (el) {
        // Offset by the navbar height so the content isn't hidden behind it
        const navbarEl = document.querySelector('.navbar') as HTMLElement;
        const navH = navbarEl ? navbarEl.offsetHeight : 80;
        const y = el.getBoundingClientRect().top + window.scrollY - navH - 12;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }, 60);
  }

  // ===== LOGIN — admin state lives ONLY in sessionStorage, never touches localStorage =====
  login() {
    if (this.loginData.username === 'admin' && this.loginData.password === 'admin123') {
      this.isAdminLoggedIn = true;
      this.loginError = '';
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      // Defer data load one tick so the dashboard *ngIf renders first
      setTimeout(() => this.loadData(), 0);
    } else {
      this.loginError = 'Invalid username or password';
    }
  }

  logout() {
    this.isAdminLoggedIn = false;
    sessionStorage.removeItem('isAdminLoggedIn');
    this.loginData = { username: '', password: '' };
    // Do NOT clear localStorage — that belongs to the patient session
    this.router.navigate(['/']);
  }
  // ================= SCHEDULES =================
  loadScheduleSlides() {
    const stored = localStorage.getItem('scheduleSlides');
    let slides = [];
    try {
      slides = stored ? JSON.parse(stored) : [];
    } catch (e) {
      slides = [];
    }

    if (slides.length === 0) {
      this.scheduleSlides = [...this.DEFAULT_SCHEDULE_SLIDES];
      localStorage.setItem('scheduleSlides', JSON.stringify(this.scheduleSlides));
    } else {
      this.scheduleSlides = slides;
    }
    this.cdr.detectChanges();
  }

  openSlideModal(slide?: ScheduleSlide, index = -1) {
    this.editingSlideIndex = index;
    this.currentSlide = slide
      ? { ...slide }
      : { src: '', alt: '' };
    this.showScheduleModal = true;
  }

  onSlideImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.currentSlide.src = e.target.result;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  saveSlide() {
    if (!this.currentSlide.src) {
      this.showToast('Please upload an image.', 'warning');
      return;
    }
    const all = [...this.scheduleSlides];
    if (this.editingSlideIndex > -1) {
      all[this.editingSlideIndex] = { ...this.currentSlide };
      this.showToast('Schedule updated!', 'success');
    } else {
      all.push({ ...this.currentSlide });
      this.showToast('Schedule added!', 'success');
    }
    localStorage.setItem('scheduleSlides', JSON.stringify(all));
    this.scheduleSlides = all;
    this.showScheduleModal = false;
    this.cdr.detectChanges();
  }

  moveScheduleSlide(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.scheduleSlides.length) return;

    const arr = [...this.scheduleSlides];
    const temp = arr[index];
    arr[index] = arr[newIndex];
    arr[newIndex] = temp;

    this.scheduleSlides = arr;
    localStorage.setItem('scheduleSlides', JSON.stringify(arr));
    this.cdr.detectChanges();
    this.showToast('Order updated!', 'success');
  }

  deleteSlide(index: number) {
    this.showConfirm('Delete this schedule image?').then(ok => {
      if (!ok) return;
      const all = this.scheduleSlides.filter((_, i) => i !== index);
      localStorage.setItem('scheduleSlides', JSON.stringify(all));
      this.scheduleSlides = all;
      this.cdr.detectChanges();
      this.showToast('Schedule deleted!', 'success');
    });
  }

  deleteContactMessage(index: number) {
    this.showConfirm('Delete this message?').then(ok => {
      if (!ok) return;
      this.contactMessages.splice(index, 1);
      localStorage.setItem('contactMessages', JSON.stringify(this.contactMessages));
      this.cdr.detectChanges();
      this.showToast('Message deleted!', 'success');
    });
  }

  loadData() {
    this.loadScheduleSlides();
    this.loadHeroSlides(); 
    this.loadUsers();

    // ✅ Load once (was duplicated 3 times)
    this.patientRequests = JSON.parse(localStorage.getItem('portalRequests') || '[]');
    this.contactMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    this.loadChronicRequests();
    this.loadNews();
    this.loadAdminEvents();

    // ✅ MERGE API appointments + localStorage appointments
    this.http.get<any[]>(`${this.apiBase}/appointments/`).subscribe({
      next: (apiData: any[]) => {
        const localData: any[] = JSON.parse(
          localStorage.getItem('patientAppointments') || '[]'
        );

        // Merge: avoid duplicates by checking a unique field (e.g. id or timestamp)
        const merged = [...apiData];
        for (const local of localData) {
          const alreadyExists = merged.some(
            a => a.id === local.id ||
              (a.name === local.name && a.date === local.date && a.doctor === local.doctor)
          );
          if (!alreadyExists) merged.push(local);
        }

        this.patientAppointments = merged;
        this.cdr.detectChanges();
      },
      error: () => {
        // API failed — fall back to localStorage only
        this.patientAppointments = JSON.parse(
          localStorage.getItem('patientAppointments') || '[]'
        );
        this.cdr.detectChanges();
      }
    });

    this.doctorService.getDoctorsFromApi().subscribe((doctors: Doctor[]) => {
      this.doctors = doctors;
      this.cdr.detectChanges();
    });

    this.cdr.detectChanges();
  }

  loadChronicRequests() {
    this.chronicRequests = JSON.parse(localStorage.getItem('chronicRequests') || '[]');
    this.cdr.detectChanges();
  }
  // ✅ This stays ONLY in admin.component.ts

  updateChronicStatus(req: any, newStatus: string) {
    const all: any[] = JSON.parse(localStorage.getItem('chronicRequests') || '[]');
    const idx = all.findIndex((r: any) => r.id === req.id);
    if (idx > -1) {
      all[idx].status = newStatus;
      all[idx].reviewedAt = new Date().toLocaleDateString();
      localStorage.setItem('chronicRequests', JSON.stringify(all));
      this.chronicRequests = all;
      this.cdr.detectChanges();
      this.showToast(`Status updated to ${newStatus}`, 'success');
    } else {
      this.showToast('Request not found.', 'error');
    }
  }
  deleteChronicRequest(req: any) {
    this.showConfirm(`Delete request for "${req.medName}"?`).then(ok => {
      if (!ok) return;
      const all: any[] = JSON.parse(localStorage.getItem('chronicRequests') || '[]');
      const updated = all.filter((r: any) => r.id !== req.id);
      localStorage.setItem('chronicRequests', JSON.stringify(updated));
      this.chronicRequests = updated;
      this.cdr.detectChanges();
      this.showToast('Request deleted.', 'success');
    });
  }

  // ---- Lightbox ----
  openLightbox(files: any[], startIndex = 0) {
    this.lightboxFiles = files;
    this.lightboxIndex = startIndex;
    this.lightboxUrl = files[startIndex]?.file_url || files[startIndex]?.url || '';
    this.lightboxFilename = files[startIndex]?.filename || `Document ${startIndex + 1}`;
    this.lightboxVisible = true;
    this.cdr.detectChanges();
  }

  lightboxNext() {
    if (this.lightboxIndex < this.lightboxFiles.length - 1) {
      this.lightboxIndex++;
      this.lightboxUrl = this.lightboxFiles[this.lightboxIndex]?.file_url || '';
      this.lightboxFilename = this.lightboxFiles[this.lightboxIndex]?.filename || '';
      this.cdr.detectChanges();
    }
  }

  lightboxPrev() {
    if (this.lightboxIndex > 0) {
      this.lightboxIndex--;
      this.lightboxUrl = this.lightboxFiles[this.lightboxIndex]?.file_url || '';
      this.lightboxFilename = this.lightboxFiles[this.lightboxIndex]?.filename || '';
      this.cdr.detectChanges();
    }
  }

  closeLightbox() {
    this.lightboxVisible = false;
    this.cdr.detectChanges();
  }

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  }

  openFile(url: string) {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  approve(req: any) {
    req.status = 'Approved';
    this.saveRequests();
    this.showToast('Patient request approved.', 'success');
  }

  processPayment(req: any) {
    req.status = 'Completed';
    this.saveRequests();
    this.showToast('Payment processed for ' + req.patientName, 'success');
  }

  saveRequests() {
    localStorage.setItem('portalRequests', JSON.stringify(this.patientRequests));
  }

  // ================= DOCTORS =================
  openDoctorModal(doctor?: Doctor) {
    if (doctor) {
      this.currentDoctor = { ...doctor };
      // Attempt to parse next_slot if it follows a specific format, otherwise leave blank
      // or just let the user set it fresh.
      if (doctor.next_slot && doctor.next_slot.includes(' at ')) {
        const parts = doctor.next_slot.split(' at ');
        this.currentDoctor.next_date = parts[0];
        this.currentDoctor.next_time = parts[1];
      }
    } else {
      this.currentDoctor = {
        name: '', specialty: '', bio: '', image: '',
        schedule: new Date().toISOString().split('T')[0], // Default to today's date
        available: true,
        next_slot: 'الآن', queue_length: 0,
        // Initialize with today's date and current time for new doctors
        next_date: new Date().toISOString().split('T')[0],
        next_time: '09:00'
      };
    }
    this.showDoctorModal = true;
  }

  saveDoctor() {
    // Combine date and time into next_slot if they are provided
    if (this.currentDoctor.next_date && this.currentDoctor.next_time) {
      this.currentDoctor.next_slot = `${this.currentDoctor.next_date} at ${this.currentDoctor.next_time}`;
    }

    const onSuccess = () => {
      this.doctorService.getDoctorsFromApi().subscribe((d: Doctor[]) => { this.doctors = d; this.cdr.detectChanges(); });
      this.showDoctorModal = false;
      this.showToast('Doctor saved successfully!', 'success');
    };
    const onError = (err: any) => this.showToast('Error: ' + (err.error?.error || JSON.stringify(err.error)), 'error');

    if (this.currentDoctor.id) {
      this.doctorService.updateDoctor(this.currentDoctor as Doctor).subscribe({ next: onSuccess, error: onError });
    } else {
      this.doctorService.addDoctor(this.currentDoctor as Omit<Doctor, 'id'>).subscribe({ next: onSuccess, error: onError });
    }
  }

  deleteDoctor(id: number) {
    this.showConfirm('Delete this doctor? This action cannot be undone.').then(ok => {
      if (!ok) return;
      this.doctorService.deleteDoctor(id).subscribe({
        next: () => {
          this.doctorService.getDoctorsFromApi().subscribe((d: Doctor[]) => { this.doctors = d; this.cdr.detectChanges(); });
          this.showToast('Doctor deleted.', 'success');
        },
        error: (err: any) => this.showToast('Error: ' + (err.error?.error || JSON.stringify(err.error)), 'error')
      });
    });
  }

  // ================= APPOINTMENTS =================
  openAppointmentModal(appointment?: any) {
    if (appointment) {
      this.currentAppointment = { ...appointment };
      this.isEditingAppointment = true;
    } else {
      this.currentAppointment = {
        reference_id: 'SKH-' + Math.floor(Math.random() * 9000 + 1000),
        patient_name: '', patient_phone: '', doctor: null,
        appointment_date: '', reason: '', status: 'Pending', payment_status: 'Unpaid'
      };
      this.isEditingAppointment = false;
    }
    this.apptSearchDoctor = '';
    this.apptFilterSpecialty = '';
    this.showAppointmentModal = true;
  }

  saveAppointment() {
    const payload = { ...this.currentAppointment };
    if (this.isEditingAppointment && this.currentAppointment.id) {
      this.http.put(`${this.apiBase}/appointments/${this.currentAppointment.id}/update/`, payload).subscribe({
        next: () => { this.loadData(); this.showAppointmentModal = false; this.showToast('Appointment updated!', 'success'); },
        error: (err: any) => {
          const msg = err.error?.status?.[0] || err.error?.detail || JSON.stringify(err.error);
          this.showToast('Save failed: ' + msg, 'error');
        }
      });
    } else {
      this.http.post(`${this.apiBase}/appointments/create/admin/`, payload).subscribe({
        next: () => { this.loadData(); this.showAppointmentModal = false; this.showToast('Appointment added!', 'success'); },
        error: (err: any) => {
          const msg = err.error?.status?.[0] || err.error?.detail || JSON.stringify(err.error);
          this.showToast('Save failed: ' + msg, 'error');
        }
      });
    }
  }

  // deleteAppointment(id: any) {
  //   this.showConfirm('Delete this appointment?').then(ok => {
  //     if (!ok) return;
  //     this.http.delete(`${this.apiBase}/appointments/${id}/delete/`).subscribe({
  //       next: () => { this.loadData(); this.showToast('Appointment deleted!', 'success'); },
  //       error: (err: any) => this.showToast('Error: ' + JSON.stringify(err.error), 'error')
  //     });
  //   });
  // }
  // deleteAppointment(id: any) {
  //     this.showConfirm('Delete this appointment?').then(ok => {
  //         if (!ok) return;

  //         // ✅ Find by id BEFORE deleting from API — use the correct array name
  //         const target = this.patientAppointments.find((a: any) => a.id === id);
  //         const refId  = target?.reference_id ?? target?.id;

  //         this.http.delete(`${this.apiBase}/appointments/${id}/delete/`).subscribe({
  //             next: () => {
  //                 // ✅ Remove from localStorage by BOTH numeric id AND SKH-XXXX reference
  //                 const existing: any[] = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
  //                 const updated = existing.filter((a: any) =>
  //                     a.id !== id &&
  //                     a.id !== refId &&
  //                     a.id !== String(id) &&
  //                     a.id !== String(refId)
  //                 );
  //                 localStorage.setItem('patientAppointments', JSON.stringify(updated));

  //                 this.loadData();
  //                 this.showToast('Appointment deleted!', 'success');
  //             },
  //             error: (err: any) => this.showToast('Error: ' + JSON.stringify(err.error), 'error')
  //         });
  //     });
  // }
  deleteAppointment(id: any) {
    this.showConfirm('Delete this appointment?').then(ok => {
      if (!ok) return;

      // Try backend first, always remove from localStorage regardless
      const removeLocally = () => {
        const existing: any[] = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
        const updated = existing.filter((a: any) =>
          a.id !== id &&
          a.id !== String(id)
        );
        localStorage.setItem('patientAppointments', JSON.stringify(updated));

        // Remove from displayed list immediately
        this.patientAppointments = this.patientAppointments.filter((a: any) =>
          a.id !== id && a.id !== String(id)
        );
        this.cdr.detectChanges();
        this.showToast('Appointment deleted!', 'success');
      };

      this.http.delete(`${this.apiBase}/appointments/${id}/delete/`).subscribe({
        next: () => removeLocally(),
        error: () => removeLocally()  // ← delete locally even if backend fails
      });
    });
  }
  // ================= NEWS =================
  // loadNews() {
  //   this.http.get<any[]>(`${this.apiBase}/news/`).subscribe({
  //     next: (data: any[]) => { this.news = data; this.cdr.detectChanges(); },
  //     error: () => { this.news = []; this.cdr.detectChanges(); }
  //   });
  // }

  // openNewsModal(article?: any) {
  //   if (article) {
  //     this.currentNews = { ...article };
  //     // Use absolute image_url so the preview <img> loads correctly across ports
  //     this.currentNews.image = article.image_url || article.image || '';
  //   } else {
  //     this.currentNews = { title: '', category: '', date: '', summary: '', content: '', image: '' };
  //   }
  //   this.showNewsModal = true;
  // }

  // saveNews() {
  //   const payload = { ...this.currentNews };
  //   if (this.currentNews.id) {
  //     this.http.put(`${this.apiBase}/news/${this.currentNews.id}/update/`, payload).subscribe({
  //       next: () => { this.loadNews(); this.showNewsModal = false; this.showToast('News updated!', 'success'); },
  //       error: (err: any) => this.showToast('Error: ' + (err.error?.error || JSON.stringify(err.error)), 'error')
  //     });
  //   } else {
  //     this.http.post(`${this.apiBase}/news/create/`, payload).subscribe({
  //       next: () => { this.loadNews(); this.showNewsModal = false; this.showToast('News added!', 'success'); },
  //       error: (err: any) => this.showToast('Error: ' + (err.error?.error || JSON.stringify(err.error)), 'error')
  //     });
  //   }
  // }
  loadNews() {
    const localNews = JSON.parse(localStorage.getItem('newsArticles') || '[]');
    
    this.http.get<any[]>(`${this.apiBase}/news/`).subscribe({
      next: (dbNews: any[]) => {
        let changed = false;
        dbNews.forEach(dbItem => {
          // Check if already imported (using title or id)
          const exists = localNews.some((l: any) => 
            (l.id && l.id === dbItem.id) || l.title === dbItem.title
          );
          if (!exists) {
            localNews.push({
              ...dbItem,
              id: dbItem.id || Date.now() + Math.random(),
              image: dbItem.image_url || dbItem.image || '',
              images: dbItem.images || []
            });
            changed = true;
          }
        });

        if (changed) {
          localStorage.setItem('newsArticles', JSON.stringify(localNews));
        }
        this.news = localNews;
        this.cdr.detectChanges();
      },
      error: () => {
        this.news = localNews;
        this.cdr.detectChanges();
      }
    });
  }

  openNewsModal(article?: any) {
    if (article) {
      this.currentNews = { ...article };
    } else {
      this.currentNews = {
        id: '',
        title: '',
        category: '',
        date: new Date().toLocaleDateString(),
        summary: '',
        content: '',
        image: ''
      };
    }
    this.showNewsModal = true;
  }

  saveNews() {
    const all: any[] = JSON.parse(localStorage.getItem('newsArticles') || '[]');

    if (this.currentNews.id) {
      // Edit existing
      const idx = all.findIndex((n: any) => n.id === this.currentNews.id);
      if (idx > -1) {
        all[idx] = { ...this.currentNews };
      }
    } else {
      // Add new
      this.currentNews.id = Date.now();
      all.unshift({ ...this.currentNews }); // unshift = newest first
    }

    localStorage.setItem('newsArticles', JSON.stringify(all));
    this.loadNews();
    this.showNewsModal = false;
    this.showToast(this.currentNews.id ? 'News updated!' : 'News added!', 'success');
  }

  deleteNews(id: any) {
    this.showConfirm('Delete this news article?').then(ok => {
      if (!ok) return;
      const all: any[] = JSON.parse(localStorage.getItem('newsArticles') || '[]');
      const updated = all.filter((n: any) => n.id !== id);
      localStorage.setItem('newsArticles', JSON.stringify(updated));
      this.loadNews();
      this.showToast('News deleted!', 'success');
    });
  }

  // deleteNews(id: number) {
  //   this.showConfirm('Delete this news article?').then(ok => {
  //     if (!ok) return;
  //     this.http.delete(`${this.apiBase}/news/${id}/delete/`).subscribe({
  //       next: () => { this.loadNews(); this.showToast('News deleted!', 'success'); },
  //       error: (err: any) => this.showToast('Error: ' + (err.error?.error || JSON.stringify(err.error)), 'error')
  //     });
  //   });
  // }

  // ================= EVENTS =================
  loadAdminEvents() {
    this.eventsService.getEvents().subscribe({
      next: (data) => { this.eventsList = data; this.cdr.detectChanges(); },
      error: () => { this.eventsList = []; }
    });
  }

  openEventModal(ev?: HospitalEvent) {
    if (ev) {
      this.currentEvent = { ...ev };
      this.currentEvent.image = (ev as any).image_url || ev.image || '';
      this.currentEvent.images = (ev as any).images || [];
      // Parse date and time if available
      if (ev.date && ev.date.includes('-')) {
        this.currentEvent.evDate = ev.date;
      }
      if (ev.time) {
        this.currentEvent.evTime = ev.time;
      }
    } else {
      this.currentEvent = {
        title: '', tag: '', date: '',
        time: '', location: '', summary: '', image: '',
        images: [], evDate: new Date().toISOString().split('T')[0], evTime: '10:00'
      };
    }
    this.showEventModal = true;
  }

  // ================= USERS =================
  loadUsers() {
    this.users = JSON.parse(localStorage.getItem('portalProfiles') || '[]');
    this.cdr.detectChanges();
  }

  openUserModal(user?: any) {
    if (user) {
      this.currentUser = { ...user };
    } else {
      this.currentUser = { first_name: '', last_name: '', email: '', phone: '', password: '' };
    }
    this.showUserModal = true;
  }

  saveUser() {
    const allUsers = JSON.parse(localStorage.getItem('portalProfiles') || '[]');
    const isEdit = !!this.currentUser.id;
    
    if (isEdit) {
      // Edit local
      const idx = allUsers.findIndex((u: any) => u.id === this.currentUser.id || u.email === this.currentUser.email);
      if (idx > -1) {
        allUsers[idx] = { ...this.currentUser };
      }
    } else {
      // Add local
      this.currentUser.id = Date.now();
      allUsers.push({ ...this.currentUser });
    }

    localStorage.setItem('portalProfiles', JSON.stringify(allUsers));
    this.showToast(isEdit ? 'User updated!' : 'User created!', 'success');
    this.showUserModal = false;
    this.loadUsers();

    // --- Backend Sync ---
    const url = isEdit ? `${this.apiBase}/users/${this.currentUser.id}/update/` : `${this.apiBase}/register/`;
    const method = isEdit ? 'put' : 'post';
    this.http.request(method, url, { body: this.currentUser }).subscribe({
      next: () => console.log('BE sync success'),
      error: (err) => console.error('BE sync failed', err)
    });
  }

  deleteUser(userId: any) {
    this.showConfirm('Are you sure you want to delete this user? They will no longer be able to log in.').then(ok => {
      if (!ok) return;
      
      // Local Delete
      const allUsers = JSON.parse(localStorage.getItem('portalProfiles') || '[]');
      const filtered = allUsers.filter((u: any) => u.id !== userId && u.email !== userId);
      localStorage.setItem('portalProfiles', JSON.stringify(filtered));
      this.showToast('User deleted successfully', 'success');
      this.loadUsers();

      // Backend Sync
      this.http.delete(`${this.apiBase}/users/${userId}/delete/`).subscribe({
        next: () => console.log('BE delete success'),
        error: (err) => console.error('BE delete failed', err)
      });
    });
  }

  saveEvent() {
    // Combine date and time pickers
    if (this.currentEvent.evDate) {
      this.currentEvent.date = this.currentEvent.evDate;
    }
    if (this.currentEvent.evTime) {
      this.currentEvent.time = this.currentEvent.evTime;
    }

    const payload = {
      ...this.currentEvent,
      image: this.currentEvent.image,
      images: this.currentEvent.images || []
    };
    const editing = this.currentEvent.id != null && this.currentEvent.id !== '';
    const finish = () => {
      this.loadAdminEvents();
      this.showEventModal = false;
      this.showToast(editing ? 'Event updated!' : 'Event added!', 'success');
    };
    if (editing) {
      const id = Number(this.currentEvent.id);
      this.eventsService.updateEvent(id, payload).subscribe({ next: finish });
    } else {
      this.eventsService.createEvent(payload).subscribe({ next: finish });
    }
  }



  deleteEvent(id: number) {
    this.showConfirm('Delete this event?').then(ok => {
      if (!ok) return;
      this.eventsService.deleteEvent(id).subscribe({
        next: () => {
          this.loadAdminEvents();
          this.showToast('Event deleted!', 'success');
        }
      });
    });
  }

  // ================= TOAST SYSTEM =================
  showToast(msg: string, type: 'success' | 'error' | 'warning' = 'success') {
    const id = ++this.toastCounter;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '!';
    this.toasts = [...this.toasts, { id, msg, type, icon }];
    this.cdr.detectChanges();
    setTimeout(() => this.dismissToast(id), 5000);
  }

  dismissToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.detectChanges();
  }

  // ================= CONFIRM DIALOG =================
  showConfirm(message: string): Promise<boolean> {
    this.confirmMessage = message;
    this.confirmVisible = true;
    this.cdr.detectChanges();
    return new Promise(resolve => {
      this.confirmResolve = resolve;
    });
  }

  onConfirmYes() {
    this.confirmVisible = false;
    this.cdr.detectChanges();
    const resolve = this.confirmResolve;
    this.confirmResolve = null;
    resolve?.(true);
  }

  onConfirmNo() {
    this.confirmVisible = false;
    this.cdr.detectChanges();
    const resolve = this.confirmResolve;
    this.confirmResolve = null;
    resolve?.(false);
  }
}