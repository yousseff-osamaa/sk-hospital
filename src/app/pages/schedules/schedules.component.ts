import { Component, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

export interface ScheduleSlide {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements OnInit, OnDestroy, AfterViewInit {
  slides: ScheduleSlide[] = [
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

  currentIndex = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = setInterval(() => this.next(), 8000);
    }
  }

  ngAfterViewInit(): void {
    if (typeof (window as any).lucide !== 'undefined') {
      (window as any).lucide.createIcons();
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goTo(i: number): void {
    this.currentIndex = i;
  }
}
