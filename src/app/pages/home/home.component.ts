import { Component, AfterViewInit, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var lucide: any;

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly DEFAULT_HERO_IMAGES = [
        '/hospital-building.jpg',
        '/slider 3.jpeg',
        '/slider 4.jpeg',
        '/slider 6.jpeg'
    ];
    heroImages: string[] = [];
    currentHeroIndex = 0;
    heroInterval: any;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private cd: ChangeDetectorRef
    ) {}

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            const stored = localStorage.getItem('heroImages');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        this.heroImages = parsed;
                    } else {
                        this.heroImages = [...this.DEFAULT_HERO_IMAGES];
                    }
                } catch {
                    this.heroImages = [...this.DEFAULT_HERO_IMAGES];
                }
            } else {
                this.heroImages = [...this.DEFAULT_HERO_IMAGES];
            }
            this.startAutoPlay();
        }
    }

    startAutoPlay() {
        if (this.heroInterval) clearInterval(this.heroInterval);
        this.heroInterval = setInterval(() => {
            this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
            this.cd.detectChanges();
        }, 6000);
    }

    nextSlide() {
        this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
        this.startAutoPlay(); // Restart timer on manual interaction
    }

    prevSlide() {
        this.currentHeroIndex = (this.currentHeroIndex - 1 + this.heroImages.length) % this.heroImages.length;
        this.startAutoPlay();
    }

    goToSlide(i: number) {
        this.currentHeroIndex = i;
        this.startAutoPlay();
    }

    ngOnDestroy() {
        if (this.heroInterval) {
            clearInterval(this.heroInterval);
        }
    }
    allServices = [
        { icon: 'alert-circle', name: '24/7 Emergency', desc: 'Ready and Responsive: Our 24/7 Emergency Services deliver swift, lifesaving care when every second counts.' },
        { icon: 'hospital', name: 'Outpatient Clinics', desc: 'Quality Care, On Your Schedule: Our Outpatient Clinics provide personalized, comprehensive healthcare without the overnight stay.' },
        { icon: 'scan', name: 'Diagnostic Imaging', desc: 'Clarity in Care: Our Diagnostic Imaging harnesses advanced technology for precise insights into your health.' },
        { icon: 'heart', name: 'Cardiology', desc: 'Heart Care at Its Best: Our Cardiology department offers comprehensive, cutting-edge solutions for your hearts health.' },
        { icon: 'smile', name: 'Dentistry', desc: 'Creating Beautiful Smiles: Our Dentistry department blends expertise and advanced care for your optimal oral health.' },
        { icon: 'sun', name: 'Dermatology & Aesthetic Medicine', desc: 'Skin Health, Elevated Beauty: Our Dermatology & Aesthetic Medicine department provides expert diagnosis and treatment for your skins health and your aesthetic aspirations.' },
        { icon: 'ear', name: 'Ear, Nose & Throat', desc: 'Your Gateway to Clear Communication: Our Ear, Nose & Throat department provides expert care for your sensory and speech health.' },
        { icon: 'stethoscope', name: 'Gastroenterology', desc: 'Guardians of Your Gut: Our Gastroenterology department provides expert diagnosis and treatment for a healthy digestive system.' },
        { icon: 'activity', name: 'General Surgery', desc: 'Skilled Hands, Caring Hearts: Our General Surgery department provides precision care for a range of surgical needs.' },
        { icon: 'user-check', name: 'Internal Medicine', desc: 'Comprehensive Care, Inside and Out: Our Internal Medicine department ensures optimal wellness through expert diagnosis and treatment of a wide range of conditions.' },
        { icon: 'bone', name: 'Orthopedics', desc: 'Strengthening Your Stride: Our Orthopedics department delivers expert care for enhanced mobility and better quality of life.' },
        { icon: 'baby', name: 'Pediatrics', desc: 'Nurturing Tomorrows Future: Our Pediatrics department provides compassionate, comprehensive care for your childs growing needs.' },
        { icon: 'accessibility', name: 'Rheumatology, Rehabilitation & Physical Medicine', desc: 'Integrating Expertise for Holistic Patient Care: Optimizing Mobility and Quality of Life to deliver Comprehensive Care.' },
        { icon: 'droplet', name: 'Urology', desc: 'Guardians of Your Urinary Health: Our Urology department delivers expert care to ensure your urinary system functions at its best.' },
        { icon: 'syringe', name: 'Vascular Medicine & Surgery', desc: 'Keeping Life Flowing: Our Vascular Medicine & Surgery department ensures your circulatory systems health through comprehensive care.' },
        { icon: 'heart-handshake', name: 'Cardiothoracic', desc: 'Heart of the Matter: Our Cardiothoracic department provides exceptional care for your heart, using state-of-the-art surgical approaches.' }
    ];

    spotlightDrs = [
        { name: 'د. تامر فاروق صيام', spec: 'جراحة القلب والصدر', image: '/Prof.drTamer.png' },
        { name: 'د. نورهان مختار', spec: 'طب وجراحة الفم والأسنان', image: '/drNourhan.png' },
        { name: 'أ.د جمال عبد الفتاح', spec: 'أنف وأذن وحنجرة', image: '/prof.drGamalAbdelftah.png' }
    ];

    blogPosts = [
        {
            title: 'افتتاح دار العزل في مدينة 6 أكتوبر',
            date: 'Jan 2021',
            image: "url('/3.jpeg')"
        },
        {
            title: 'إنجازات قسمي القلب والطوارئ',
            date: 'Oct 2020',
            image: "url('/4.jpeg')"
        }
    ];

    ngAfterViewInit() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}
