import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface Doctor {
    id: number;
    name: string;
    specialty: string;
    bio: string;
    image: string;
    schedule: string;
    available: boolean;
    next_slot: string;
    queue_length: number;
    nextSlot?: string;
    queueLength?: number;
    clinic_number?: string;
}

@Injectable({ providedIn: 'root' })
export class DoctorService {
    private apiUrl = 'http://127.0.0.1:8000/api/doctors/';

    constructor(private http: HttpClient) {}

    getDoctorsFromApi(): Observable<Doctor[]> {
        return this.http.get<Doctor[]>(this.apiUrl).pipe(
            tap((doctors: Doctor[]) => {
                doctors.forEach((d: Doctor) => {
                    d.nextSlot = d.next_slot;
                    d.queueLength = d.queue_length;
                });
                localStorage.setItem('doctors', JSON.stringify(doctors));
            }),
            catchError(() => {
                const stored = localStorage.getItem('doctors');
                return of(stored ? JSON.parse(stored) : []);
            })
        );
    }

    getDoctors(): Doctor[] {
        const stored = localStorage.getItem('doctors');
        return stored ? JSON.parse(stored) : [];
    }

    saveDoctors(doctors: Doctor[]): void {
        localStorage.setItem('doctors', JSON.stringify(doctors));
    }

    addDoctor(doctor: Omit<Doctor, 'id'>): Observable<Doctor> {
        return this.http.post<Doctor>(`${this.apiUrl}create/`, doctor).pipe(
            tap((newDoctor: Doctor) => {
                const doctors = this.getDoctors();
                newDoctor.nextSlot = newDoctor.next_slot;
                newDoctor.queueLength = newDoctor.queue_length;
                doctors.push(newDoctor);
                this.saveDoctors(doctors);
            })
        );
    }

    updateDoctor(updatedDoctor: Doctor): Observable<Doctor> {
        return this.http.put<Doctor>(`${this.apiUrl}${updatedDoctor.id}/update/`, updatedDoctor).pipe(
            tap((doctor: Doctor) => {
                const doctors = this.getDoctors();
                const index = doctors.findIndex((d: Doctor) => d.id === doctor.id);
                if (index !== -1) {
                    doctors[index] = doctor;
                    this.saveDoctors(doctors);
                }
            })
        );
    }

    deleteDoctor(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}${id}/delete/`).pipe(
            tap(() => {
                let doctors = this.getDoctors();
                doctors = doctors.filter((d: Doctor) => d.id !== id);
                this.saveDoctors(doctors);
            })
        );
    }
}