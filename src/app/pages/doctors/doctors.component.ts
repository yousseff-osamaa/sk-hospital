import { Component, AfterViewInit, OnInit } from '@angular/core';
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

    constructor(private doctorService: DoctorService) {}

    ngOnInit() {
        this.doctorService.getDoctorsFromApi().subscribe((list) => {
            this.doctors = list.length ? list : this.doctorService.getDoctors();
        });
    }

    ngAfterViewInit() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}


