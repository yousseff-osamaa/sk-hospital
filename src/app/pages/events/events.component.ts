import { Component, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsService } from '../../services/events.service';

declare var lucide: { createIcons: () => void } | undefined;

export interface HospitalEvent {
  id?: number;
  title: string;
  date: string;
  time?: string;
  location?: string;
  summary: string;
  image: string;
  images?: string[];
  tag?: string;
  evDate?: string;
  evTime?: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit, AfterViewInit {
  events: HospitalEvent[] = [];
  displayCount = 2;
  selectedEvent: HospitalEvent | null = null;

  viewEvent(ev: HospitalEvent): void {
    this.selectedEvent = ev;
    this.cd.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeEvent(): void {
    this.selectedEvent = null;
    this.cd.detectChanges();
    this.refreshLucide();
  }

  constructor(
    private readonly eventsService: EventsService,
    private readonly cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.eventsService.getEvents().subscribe({
      next: (data) => {
        this.events = (data as unknown as HospitalEvent[]) ?? [];
        this.displayCount = this.events.length <= 2 ? this.events.length : 2;
        this.cd.detectChanges();
        this.refreshLucide();
      },
      error: () => {
        this.events = [];
        this.cd.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    this.refreshLucide();
  }

  showAllEvents(): void {
    this.displayCount = this.events.length;
    this.cd.detectChanges();
    this.refreshLucide();
  }

  trackEvent(_index: number, ev: HospitalEvent): string | number {
    return ev.id ?? ev.title;
  }

  private refreshLucide(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }
}
