import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var lucide: any;

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent implements AfterViewInit {
    ngAfterViewInit() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}
