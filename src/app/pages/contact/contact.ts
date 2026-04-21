import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="premium-hero" style="background-image: url('/hospital-building.jpg')">
        <div class="hero-overlay"></div>
        <div class="container hero-content fade-in">
            <span class="hero-badge">Get in Touch</span>
            <h1>Contact <span class="highlight">Us</span></h1>
            <p>We are here to help and answer any questions you might have.</p>
            <div class="hero-divider"></div>
        </div>
    </section>

    <section id="contactForm" class="section-padding container">
        <div style="max-width: 600px; margin: 0 auto; padding: 2.5rem; border-radius: 16px; background: white; box-shadow: 0 8px 24px rgba(10, 79, 166, 0.12);">
            <h2 style="color: var(--primary-dark); margin-bottom: 2rem; text-align: center;">Send Us A Message</h2>
            
            <div *ngIf="successMsg" style="padding: 1rem; background: #d1fae5; color: #00734c; border-radius: 8px; margin-bottom: 1.5rem; text-align: center; font-weight: 500;">
                {{ successMsg }}
            </div>

            <div class="form-group" style="margin-bottom: 1.2rem;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">First Name</label>
                <input type="text" [(ngModel)]="contactName" class="form-control" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px;">
            </div>
            <div class="form-group" style="margin-bottom: 1.2rem;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Last Name</label>
                <input type="text" [(ngModel)]="contactName" class="form-control" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px;">
            </div>
            <div class="form-group" style="margin-bottom: 1.2rem;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Email</label>
                <input type="text" [(ngModel)]="contactName" class="form-control" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px;">
            </div>
            
            <div class="form-group" style="margin-bottom: 1.2rem;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Phone </label>
                <input type="text" [(ngModel)]="contactPhone" class="form-control" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px;">
            </div>
            <div class="form-group" style="margin-bottom: 1.2rem;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Title</label>
                <input type="text" [(ngModel)]="contactName" class="form-control" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px;">
            </div>
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Message</label>
                <textarea [(ngModel)]="contactBody" rows="5" class="form-control" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px;"></textarea>
            </div>
            
            <button class="btn btn-primary w-100" (click)="submitContact()" style="width: 100%; padding: 1rem; font-size: 1rem;">Send Message</button>
        </div>
    </section>
  `,
  styles: ``
})
export class Contact {
    contactName = '';
    contactPhone = '';
    contactBody = '';
    successMsg = '';

    submitContact() {
        if (!this.contactName || !this.contactPhone || !this.contactBody) {
            alert('Please fill all fields');
            return;
        }

        let msgs = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        msgs.push({
            id: Date.now(),
            name: this.contactName,
            contact: this.contactPhone,
            body: this.contactBody,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('contactMessages', JSON.stringify(msgs));

        this.successMsg = 'Message sent successfully! Our team will contact you soon.';
        this.contactName = '';
        this.contactPhone = '';
        this.contactBody = '';
        
        setTimeout(() => this.successMsg = '', 5000);
    }
}
