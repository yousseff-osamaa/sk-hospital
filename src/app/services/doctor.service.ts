import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
    private readonly apiUrl = `${environment.apiUrl}/doctors/`;
    private readonly LOCAL_KEY = 'local_doctors';

    constructor(private http: HttpClient) {}

    private getLocalDoctors(): Doctor[] {
        const stored = localStorage.getItem(this.LOCAL_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    private saveLocalDoctors(doctors: Doctor[]): void {
        localStorage.setItem(this.LOCAL_KEY, JSON.stringify(doctors));
    }

    getDoctorsFromApi(): Observable<Doctor[]> {
        return this.http.get<Doctor[]>(this.apiUrl).pipe(
            map((apiDoctors: Doctor[]) => {
                apiDoctors.forEach((d: Doctor) => {
                    d.nextSlot = d.next_slot;
                    d.queueLength = d.queue_length;
                    if ((d as any).image_url) {
                        d.image = (d as any).image_url;
                    }
                });

                // Merge with local doctors (those that failed API save)
                const local = this.getLocalDoctors();
                const apiNames = new Set(apiDoctors.map(d => d.name.toLowerCase()));
                
                // Avoid duplicates: if a doctor with same name exists in API, favor API
                const uniqueLocal = local.filter(d => !apiNames.has(d.name.toLowerCase()));
                
                const merged = [...apiDoctors, ...uniqueLocal];
                localStorage.setItem('doctors', JSON.stringify(merged));
                return merged;
            }),
            catchError(() => {
                // Fallback to the last cached 'doctors' list if API fails
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
                // Success: clean up local if it was there
                const local = this.getLocalDoctors().filter(d => d.name !== doctor.name);
                this.saveLocalDoctors(local);
                
                const doctors = this.getDoctors();
                newDoctor.nextSlot = newDoctor.next_slot;
                newDoctor.queueLength = newDoctor.queue_length;
                doctors.push(newDoctor);
                this.saveDoctors(doctors);
            }),
            catchError((err) => {
                // Fallback: save locally if API fails (e.g. image too long)
                const local = this.getLocalDoctors();
                const newLocal: Doctor = { 
                    ...doctor, 
                    id: Date.now() 
                } as Doctor;
                local.push(newLocal);
                this.saveLocalDoctors(local);
                
                // Update the current working list too
                const current = this.getDoctors();
                current.push(newLocal);
                this.saveDoctors(current);
                
                return of(newLocal);
            })
        );
    }

    updateDoctor(updatedDoctor: Doctor): Observable<Doctor> {
        return this.http.put<Doctor>(`${this.apiUrl}${updatedDoctor.id}/update/`, updatedDoctor).pipe(
            tap((doctor: Doctor) => {
                // Success: remove from local if it was a transitioned local doctor
                const local = this.getLocalDoctors().filter(d => d.id !== updatedDoctor.id && d.name !== updatedDoctor.name);
                this.saveLocalDoctors(local);

                const doctors = this.getDoctors();
                const index = doctors.findIndex((d: Doctor) => d.id === doctor.id);
                if (index !== -1) {
                    doctors[index] = doctor;
                    this.saveDoctors(doctors);
                }
            }),
            catchError(() => {
                // Fallback: update in local storage
                const local = this.getLocalDoctors();
                const index = local.findIndex(d => d.id === updatedDoctor.id);
                if (index !== -1) {
                    local[index] = updatedDoctor;
                } else {
                    local.push(updatedDoctor);
                }
                this.saveLocalDoctors(local);

                const doctors = this.getDoctors();
                const dIndex = doctors.findIndex(d => d.id === updatedDoctor.id);
                if (dIndex !== -1) {
                    doctors[dIndex] = updatedDoctor;
                    this.saveDoctors(doctors);
                }
                return of(updatedDoctor);
            })
        );
    }

    deleteDoctor(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}${id}/delete/`).pipe(
            tap(() => {
                this.removeLocally(id);
            }),
            catchError(() => {
                this.removeLocally(id);
                return of(null);
            })
        );
    }

    private removeLocally(id: number) {
        let local = this.getLocalDoctors();
        local = local.filter(d => d.id !== id);
        this.saveLocalDoctors(local);

        let doctors = this.getDoctors();
        doctors = doctors.filter((d: Doctor) => d.id !== id);
        this.saveDoctors(doctors);
    }
}