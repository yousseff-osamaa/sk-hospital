import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'] // تأكدي إن الملف ده موجود أو غيري الامتداد لـ .css
})
export class SliderComponent implements OnInit, OnDestroy {
  heroImages = [
    '/hospital-building.jpg',
    '/assets/slider-promo-uva.png',
    '/assets/slider-promo-body-checkup.png',
    '/slider 3.jpeg',
    '/slider 4.jpeg',
    '/slider 6.jpeg',
    '/assets/photo.png'
  ];
  /** Signal so autoplay updates the view without Zone.js. */
  readonly currentHeroIndex = signal(0);
  heroInterval: ReturnType<typeof setInterval> | null = null;
  readonly autoPlayMs = 3000;
  private isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) this.startAutoPlay();
  }

  startAutoPlay() {
    this.stopAutoPlay();
    if (this.heroImages.length <= 1) return;
    this.heroInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayMs);
  }

  stopAutoPlay() {
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
      this.heroInterval = null;
    }
  }

  resetAutoPlay() {
    if (this.isBrowser) {
      this.startAutoPlay();
    }
  }

  nextSlide() {
    this.currentHeroIndex.update(
      (i) => (i + 1) % this.heroImages.length
    );
  }

  prevSlide() {
    this.currentHeroIndex.update(
      (i) => (i - 1 + this.heroImages.length) % this.heroImages.length
    );
    this.resetAutoPlay();
  }

  onNextClick() {
    this.nextSlide();
    this.resetAutoPlay();
  }

  goToSlide(index: number) {
    this.currentHeroIndex.set(index);
    this.resetAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }
}
