import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
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
  currentHeroIndex = 0;
  heroInterval: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoPlay();
    }
  }

  startAutoPlay() {
    this.heroInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
  }

  prevSlide() {
    this.currentHeroIndex = (this.currentHeroIndex - 1 + this.heroImages.length) % this.heroImages.length;
  }

  goToSlide(index: number) {
    this.currentHeroIndex = index;
  }

  ngOnDestroy() {
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
    }
  }
}
