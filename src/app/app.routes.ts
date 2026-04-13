import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AppointmentComponent } from './pages/appointment/appointment.component';
import { PatientPortalComponent } from './pages/portal/portal.component';
import { AboutComponent } from './pages/about/about.component';
import { DoctorListComponent } from './pages/doctors/doctors.component';
import { NewsComponent } from './pages/news/news';
import { Contact } from './pages/contact/contact';
import { Admin } from './pages/admin/admin';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';

import { OurServiceComponent } from './pages/our-service/our-service.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'appointment', component: AppointmentComponent },
    { path: 'portal', component: PatientPortalComponent },
    { path: 'about', component: AboutComponent },
    { path: 'doctors', component: DoctorListComponent },
    { path: 'news', component: NewsComponent },
    { path: 'services', component: OurServiceComponent },
    { path: 'contact', component: Contact },
    { path: 'admin', component: Admin },
    { path: 'verify-email', component: VerifyEmailComponent },
    { path: '**', redirectTo: '' }
];
