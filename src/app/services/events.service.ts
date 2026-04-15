import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const STORAGE_KEY = 'sk_hospital_events';

const DEFAULT_EVENTS: Record<string, unknown>[] = [
  {
    id: 90001,
    tag: 'Community',
    title: 'Health awareness day',
    date: 'Upcoming',
    time: '10:00 AM – 4:00 PM',
    location: 'Main lobby',
    summary:
      'Free screenings, nutrition counselling, and talks on preventive care. Open to patients and visitors.',
    image: '/assets/slider-promo-body-checkup.png'
  },
  {
    id: 90002,
    tag: 'Education',
    title: 'Workshop: sun protection & skin health',
    date: 'Monthly',
    time: '2:00 PM',
    location: 'Dermatology wing',
    summary:
      'Learn about UV safety and early detection. Our dermatology team hosts regular patient education sessions.',
    image: '/assets/slider-promo-uva.png'
  },
  {
    id: 90003,
    tag: 'Hospital',
    title: 'Tours & family orientation',
    date: 'On request',
    time: '',
    location: 'Reception',
    summary:
      'Guided visits for families and new patients to help you find departments, parking, and support services with ease.',
    image: '/hospital-building.jpg'
  }
];

@Injectable({ providedIn: 'root' })
export class EventsService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiUrl;

  getEvents(): Observable<Record<string, unknown>[]> {
    return this.http.get<Record<string, unknown>[]>(`${this.apiBase}/events/`).pipe(
      map((events) => events.map(e => ({
        ...e,
        // prefer the absolute image_url returned by the backend
        image: (e['image_url'] as string) || (e['image'] as string) || ''
      }))),
      catchError(() => of(this.readLocal()))
    );
  }

  private readLocal(): Record<string, unknown>[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      this.writeLocal(DEFAULT_EVENTS);
      return DEFAULT_EVENTS.map((e) => ({ ...e }));
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : [];
    } catch {
      return [];
    }
  }

  private writeLocal(events: Record<string, unknown>[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }

  createEvent(payload: Record<string, unknown>): Observable<void> {
    const body = { ...payload };
    delete body['id'];
    return this.http.post<void>(`${this.apiBase}/events/create/`, body).pipe(
      map(() => undefined),
      catchError(() => {
        const list = this.readLocal();
        list.unshift({ ...body, id: Date.now() });
        this.writeLocal(list);
        return of(undefined);
      })
    );
  }

  createEventWithFile(formData: FormData): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/events/create/`, formData).pipe(
      map(() => undefined)
    );
  }

  updateEvent(id: number, payload: Record<string, unknown>): Observable<void> {
    return this.http.patch<void>(`${this.apiBase}/events/${id}/update/`, payload).pipe(
      map(() => undefined),
      catchError(() => {
        const list = this.readLocal();
        const i = list.findIndex((e) => e['id'] === id);
        if (i > -1) {
          list[i] = { ...payload, id };
          this.writeLocal(list);
        }
        return of(undefined);
      })
    );
  }

  updateEventWithFile(id: number, formData: FormData): Observable<void> {
    return this.http.patch<void>(`${this.apiBase}/events/${id}/update/`, formData).pipe(
      map(() => undefined)
    );
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/events/${id}/delete/`).pipe(
      map(() => undefined),
      catchError(() => {
        const list = this.readLocal().filter((e) => e['id'] !== id);
        this.writeLocal(list);
        return of(undefined);
      })
    );
  }
}
