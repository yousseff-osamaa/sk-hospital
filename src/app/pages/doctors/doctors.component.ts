import { Component, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DoctorService, Doctor } from '../../services/doctor.service';

declare var lucide: any;

@Component({
    selector: 'app-doctors',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './doctors.component.html',
    styleUrls: ['./doctors.component.scss']
})
export class DoctorListComponent implements AfterViewInit, OnInit {
    doctors: Doctor[] = [];

    constructor(private doctorService: DoctorService,
        private cd: ChangeDetectorRef 
    ) {}

    ngOnInit() {
        this.doctorService.getDoctorsFromApi().subscribe((list) => {
            this.doctors = list.length ? list : this.doctorService.getDoctors();
            this.cd.detectChanges();
        });
    }

    ngAfterViewInit() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}


