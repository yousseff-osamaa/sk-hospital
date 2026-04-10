import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

declare var lucide: any;

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements AfterViewInit {
    isMenuOpen = false;

    ngAfterViewInit() {
    this.initIcons();
  }
  initIcons() {
    if (typeof lucide !== 'undefined') {
      // This command finds all <i data-lucide="..."> and turns them into icons
      lucide.createIcons();
    }
}

}
