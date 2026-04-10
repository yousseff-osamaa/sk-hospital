import { Injectable } from '@angular/core';

export interface Doctor {
    id: number;
    name: string;
    specialty: string;
    bio: string;
    image: string;
    schedule: string;
    available: boolean;
    nextSlot: string;
    queueLength: number;
}

@Injectable({
    providedIn: 'root'
})
export class DoctorService {
    private readonly STORAGE_KEY = 'doctors';

    getDoctors(): Doctor[] {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        const initialDoctors: Doctor[] = [
            { id: 1, name: 'د. تامر فاروق صيام', specialty: 'جراحة القلب والصدر', bio: 'أستاذ جراحة القلب والصدر بجامعة القاهرة ورئيس قسم جراحة القلب والصدر بمستشفى سعاد كفافي.', image: '/Prof.drTamer.png', schedule: 'الإثنين والخميس: 10 ص - 2 م', available: true, nextSlot: 'الآن', queueLength: 3 },
            { id: 2, name: 'د. نورهان مختار', specialty: 'طب وجراحة الفم والأسنان', bio: 'استشاري طب وجراحة الفم والأسنان بمستشفى سعاد كفافي.', image: '/drNourhan.png', schedule: 'السبت والإثنين: 12 م - 4 م', available: true, nextSlot: 'الآن', queueLength: 5 },
            { id: 3, name: 'د. أحمد ثروت أحمد', specialty: 'تركيبات وزراعة الأسنان', bio: 'استشاري تركيبات وزراعة الأسنان بمستشفى سعاد كفافي.', image: '/drAhmedtharwat.png', schedule: 'الأحد والأربعاء: 9 ص - 1 م', available: true, nextSlot: 'الآن', queueLength: 2 },
            { id: 4, name: 'أ.د أحمد بسيوني', specialty: 'تقويم الأسنان', bio: 'أستاذ تقويم الأسنان بكلية طب الأسنان واستشاري التقويم بمستشفى سعاد كفافي.', image: '/prof.drAhmed basiony.png', schedule: 'الثلاثاء: 10 ص - 3 م', available: true, nextSlot: 'الآن', queueLength: 4 },
            { id: 5, name: 'أ.د محمود الأصيل', specialty: 'علاج الجذور', bio: 'أستاذ علاج الجذور بكلية طب الأسنان بجامعة مصر واستشاري علاج الجذور بمستشفى سعاد كفافي.', image: '/prof.drMahmoudAseel.png', schedule: 'الإثنين والأربعاء: 1 م - 5 م', available: true, nextSlot: 'الآن', queueLength: 1 },
            { id: 6, name: 'د. محمد نشأت محمد', specialty: 'طب أسنان الأطفال', bio: 'اخصائي طب اسنان اطفال.', image: '/dr.mohamedNshat.png', schedule: 'الخميس: 9 ص - 2 م', available: true, nextSlot: 'الآن', queueLength: 6 },
            { id: 7, name: 'د. نهال شايل', specialty: 'أسنان أطفال', bio: 'د. اسنان اطفال ووحدة المفاصل بجامعة مصر ورئيس وحدة علاج اسنان الاطفال بمستشفى سعاد كفافي.', image: '/drNehalKabel.png', schedule: 'الأحد والثلاثاء: 10 ص - 2 م', available: true, nextSlot: 'الآن', queueLength: 3 },
            { id: 8, name: 'د. عمرو خيري مرسي', specialty: 'تجميل الأسنان', bio: 'مدرس مساعد فسيولوجيا الاسنان جامعة مصر للعلوم والتكنولوجيا واخصائي تجميل بمستشفى سعاد كفافي.', image: '/drAmrkhairy.png', schedule: 'الإثنين والأربعاء: 12 م - 4 م', available: true, nextSlot: 'الآن', queueLength: 2 },
            { id: 9, name: 'د. محمد علي الزامل', specialty: 'رمد', bio: 'استشاري رمد بمستشفى سعاد كفافي.', image: '/drMohamedAliElzamel.png', schedule: 'السبت: 10 ص - 2 م', available: true, nextSlot: 'الآن', queueLength: 5 },
            { id: 10, name: 'أ.د جمال عبد الفتاح', specialty: 'أنف وأذن وحنجرة', bio: 'رئيس قسم الأنف والأذن والحنجرة بمستشفى سعاد كفافي.', image: '/prof.drGamalAbdelftah.png', schedule: 'الأحد والثلاثاء: 9 ص - 1 م', available: false, nextSlot: 'غداً 10:00 ص', queueLength: 0 },
            { id: 11, name: 'د. وائل علي محمد الزمر', specialty: 'أنف وأذن وحنجرة', bio: 'استشاري أنف وأذن وحنجرة بمستشفى سعاد كفافي.', image: '/drWaelAliMohamedElzamr.png', schedule: 'الإثنين والخميس: 12 م - 3 م', available: true, nextSlot: 'الآن', queueLength: 3 },
            { id: 12, name: 'د. كريم مراد', specialty: 'جراحة مخ وأعصاب', bio: 'استشاري جراحة مخ وأعصاب بمستشفى سعاد كفافي.', image: '/drKareemMorad.png', schedule: 'السبت والأربعاء: 10 ص - 2 م', available: true, nextSlot: 'الآن', queueLength: 2 },
            { id: 13, name: 'أ.د ماجدة عبد الحميد', specialty: 'طب أطفال', bio: 'أستاذ طب أطفال وحديثي الولادة بجامعة الزقازيق واستشاري اطفال بمستشفى سعاد كفافي.', image: '/prof.drMagdaAbdelhameed.png', schedule: 'الأحد والخميس: 11 ص - 3 م', available: true, nextSlot: 'الآن', queueLength: 4 },
            { id: 14, name: 'أ.د شريف عبد الرحمن', specialty: 'جراحة الكلى والمسالك', bio: 'أستاذ جراحة الكلى والمسالك بجامعة القاهرة واستشاري ورئيس قسم المسالك البولية بمستشفى سعاد كفافي.', image: '/prof.drSherefAbdulrahman.png', schedule: 'الإثنين: 9 ص - 12 م', available: true, nextSlot: 'الآن', queueLength: 1 },
            { id: 15, name: 'أ.د حمدي محمد ابراهيم', specialty: 'جراحة المسالك البولية', bio: 'أستاذ جراحة المسالك البولية بجامعة الفيوم واستشاري جراحة المسالك بمستشفى سعاد كفافي.', image: '/pro.drHamdyMohamedIbrahim.png', schedule: 'الثلاثاء: 1 م - 5 م', available: true, nextSlot: 'الآن', queueLength: 3 },
            { id: 16, name: 'د. مينا صفوت سميك', specialty: 'جراحة المسالك البولية', bio: 'استشاري جراحة المسالك البولية بمستشفى سعاد كفافي.', image: '/drMinaSafwat.png', schedule: 'الاربعاء: 10 ص - 2 م', available: true, nextSlot: 'الآن', queueLength: 2 },
            { id: 17, name: 'د. نعمان محمد كمال الشافي', specialty: 'جراحة الوجه والفكين', bio: 'استشاري جراحة الوجه والفكين بمستشفى سعاد كفافي.', image: '/drNoamanMohamed.png', schedule: 'الخميس: 12 م - 4 م', available: true, nextSlot: 'الآن', queueLength: 5 },
            { id: 18, name: 'د. لطفي الفيلالي', specialty: 'جراحة الفم والوجة والفكين', bio: 'استشاري جراحة الفم والوجة والفكين بمستشفى سعاد كفافي وزميل الكلية الملكية للجراحين بأدنبرة.', image: '/drLotfykelany.png', schedule: 'السبت والأحد: 10 ص - 2 م', available: true, nextSlot: 'الآن', queueLength: 3 },
            { id: 19, name: 'أ.د خيري المرسي', specialty: 'جراحة الفم والوجة والفكين', bio: 'أستاذ جراحة الفم والوجة والفكين بكلية طب الأسنان جامعة القاهرة.', image: '/prof.drkhairyelmorsy.png', schedule: 'الثلاثاء والخميس: 1 م - 4 م', available: true, nextSlot: 'الآن', queueLength: 2 },
            { id: 20, name: 'د. ليلى عبد العظيم رفعت', specialty: 'باطنة وأورام', bio: 'استشاري امراض باطنة واستشاري بنك الدم والأورام بمستشفى سعاد كفافي.', image: '/drLobnaAbdelazem.png', schedule: 'الإثنين والأربعاء: 11 ص - 3 م', available: true, nextSlot: 'الآن', queueLength: 4 },
            { id: 21, name: 'د. هاني جمال', specialty: 'التخدير والعناية المركزة', bio: 'رئيس قسم التخدير والعناية المركزة وعلاج الألم بمستشفى سعاد كفافي.', image: '/drHanyGamal.png', schedule: 'متاح للعمليات 24/7', available: true, nextSlot: 'الآن', queueLength: 0 }
        ];
        this.saveDoctors(initialDoctors);
        return initialDoctors;
    }

    saveDoctors(doctors: Doctor[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(doctors));
    }

    addDoctor(doctor: Omit<Doctor, 'id'>): void {
        const doctors = this.getDoctors();
        const newId = doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
        doctors.push({ ...doctor, id: newId });
        this.saveDoctors(doctors);
    }

    updateDoctor(updatedDoctor: Doctor): void {
        const doctors = this.getDoctors();
        const index = doctors.findIndex(d => d.id === updatedDoctor.id);
        if (index !== -1) {
            doctors[index] = updatedDoctor;
            this.saveDoctors(doctors);
        }
    }

    deleteDoctor(id: number): void {
        let doctors = this.getDoctors();
        doctors = doctors.filter(d => d.id !== id);
        this.saveDoctors(doctors);
    }
}
