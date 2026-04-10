import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var lucide: any;

@Component({
    selector: 'app-our-service',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './our-service.component.html',
    styleUrls: ['./our-service.component.scss']
})
export class OurServiceComponent implements AfterViewInit {
    services = [
    {image: 'assets/Emergency.jpg',
    name: '24/7 Emergency',
    desc: 'Ready and Responsive: Our 24/7 Emergency Services deliver swift, lifesaving care when every second counts.'},
        {
    image: 'assets/out_clinics.jpg',
    name: 'Outpatient Clinics',
    desc: 'Quality Care, On Your Schedule: Our Outpatient Clinics provide personalized, comprehensive healthcare without the overnight stay.'},
        { image: 'assets/Diagnostic Imaging.jpg', name: 'Diagnostic Imaging', desc: 'Clarity in Care: Our Diagnostic Imaging harnesses advanced technology for precise insights into your health.' },
        { image: 'assets/Cardiology.jpg', name: 'Cardiology', desc: 'Heart Care at Its Best: Our Cardiology department offers comprehensive, cutting-edge solutions for your hearts health.' },
        { image: 'assets/Dentistry.jpg', name: 'Dentistry', desc: 'Creating Beautiful Smiles: Our Dentistry department blends expertise and advanced care for your optimal oral health.' },
        {image: 'assets/Dermatology&Aesthetic.jpg', name: 'Dermatology & Aesthetic Medicine', desc: 'Skin Health, Elevated Beauty: Our Dermatology & Aesthetic Medicine department provides expert diagnosis and treatment for your skins health and your aesthetic aspirations.' },
        { image: 'assets/Ear, Nose&Throat.jpg', name: 'Ear, Nose & Throat', desc: 'Your Gateway to Clear Communication: Our Ear, Nose & Throat department provides expert care for your sensory and speech health.' },
        { image: 'assets/Gastroenterology.jpg', name: 'Gastroenterology', desc: 'Guardians of Your Gut: Our Gastroenterology department provides expert diagnosis and treatment for a healthy digestive system.' },
        {  image: 'assets/General Surgery.jpg', name: 'General Surgery', desc: 'Skilled Hands, Caring Hearts: Our General Surgery department provides precision care for a range of surgical needs.' },
        { image: 'assets/Internal Medicine.jpg', name: 'Internal Medicine', desc: 'Comprehensive Care, Inside and Out: Our Internal Medicine department ensures optimal wellness through expert diagnosis and treatment of a wide range of conditions.' },
        { image: 'assets/Orthopedics.jpg', name: 'Orthopedics', desc: 'Strengthening Your Stride: Our Orthopedics department delivers expert care for enhanced mobility and better quality of life.' },
        { image: 'assets/Pediatrics.jpg', desc: 'Nurturing Tomorrows Future: Our Pediatrics department provides compassionate, comprehensive care for your childs growing needs.' },
        { image: 'assets/Rheumatology, Rehabilitation & Physical Medicine.jpg', name: 'Rheumatology, Rehabilitation & Physical Medicine', desc: 'Integrating Expertise for Holistic Patient Care: Optimizing Mobility and Quality of Life to deliver Comprehensive Care.' },
        { image: 'assets/Urology.jpg', name: 'Urology', desc: 'Guardians of Your Urinary Health: Our Urology department delivers expert care to ensure your urinary system functions at its best.' },
        { image: 'assets/Vascular Medicine & Surgery.jpg', name: 'Vascular Medicine & Surgery', desc: 'Keeping Life Flowing: Our Vascular Medicine & Surgery department ensures your circulatory systems health through comprehensive care.' },
        { image: 'assets/Cardiothoracic.jpg', name: 'Cardiothoracic', desc: 'Heart of the Matter: Our Cardiothoracic department provides exceptional care for your heart, using state-of-the-art surgical approaches.' }
    ];

    ngAfterViewInit() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}
