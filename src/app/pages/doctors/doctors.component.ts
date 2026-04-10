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
scheduleTables = [
        { title: 'جدول مواعيد عيادات الجراحة والقلب', image: '/doc1.jpg' },
        { title: 'جدول مواعيد عيادات العظام والجلدية', image: '/doc2.jpg' },
        { title: 'جدول مواعيد عيادات الباطنة والأطفال', image: '/doc3.jpg' },
        { title: 'جدول مواعيد الطوارئ والخدمات العاجلة', image: '/doc4.jpg' },
        { title: 'جدول مواعيد العيادات التخصصية', image: '/doc5.jpg' },
         { title: 'جدول مواعيد العيادات التخصصية', image: '/doc6.jpg' },
          { title: 'جدول مواعيد العيادات التخصصية', image: '/doc7.jpg' }
    ];

    constructor(private doctorService: DoctorService) {}

    ngOnInit() {
        this.doctors = this.doctorService.getDoctors();
    }

    ngAfterViewInit() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}


