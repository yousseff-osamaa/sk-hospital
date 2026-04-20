import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent implements OnInit, OnDestroy {

  readonly defaultHeroImages: string[] = [
    '/hospital-building.jpg',
    '/assets/slider-promo-uva.png',
    '/assets/slider-promo-body-checkup.png',
    '/slider 3.jpeg',
    '/slider 4.jpeg',
    '/slider 6.jpeg',
    '/assets/photo.png'
  ];

  heroImages: string[] = [];
  readonly currentHeroIndex = signal(0);
  heroInterval: ReturnType<typeof setInterval> | null = null;
  readonly autoPlayMs = 3000;
  private isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadHeroImages();

    if (this.isBrowser) {
      this.startAutoPlay();

      // ✅ Listens for admin saving to localStorage in another tab
      window.addEventListener('storage', this.onStorageChange);
    }
  }

  // ✅ Arrow function keeps correct 'this' binding
  private onStorageChange = (event: StorageEvent): void => {
    if (event.key === 'heroImages') {
      this.loadHeroImages();
      this.currentHeroIndex.set(0);
      this.resetAutoPlay();
    }
  };

  loadHeroImages(): void {
    if (!this.isBrowser) {
      this.heroImages = [...this.defaultHeroImages];
      return;
    }
    try {
      const stored = localStorage.getItem('heroImages');
      const storedImages: string[] = stored ? JSON.parse(stored) : [];
      this.heroImages = [...storedImages, ...this.defaultHeroImages];
    } catch {
      this.heroImages = [...this.defaultHeroImages];
    }
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    if (this.heroImages.length <= 1) return;
    this.heroInterval = setInterval(() => this.nextSlide(), this.autoPlayMs);
  }

  stopAutoPlay(): void {
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
      this.heroInterval = null;
    }
  }

  resetAutoPlay(): void {
    if (this.isBrowser) this.startAutoPlay();
  }

  nextSlide(): void {
    this.currentHeroIndex.update(i => (i + 1) % this.heroImages.length);
  }

  prevSlide(): void {
    this.currentHeroIndex.update(i => (i - 1 + this.heroImages.length) % this.heroImages.length);
    this.resetAutoPlay();
  }

  goToSlide(index: number): void {
    this.currentHeroIndex.set(index);
    this.resetAutoPlay();
  }

  onNextClick(): void {
    this.nextSlide();
    this.resetAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    // ✅ Always clean up event listeners
    if (this.isBrowser) {
      window.removeEventListener('storage', this.onStorageChange);
    }
  }
  
}