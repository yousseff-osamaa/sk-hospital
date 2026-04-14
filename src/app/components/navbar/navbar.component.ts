import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

declare var lucide: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  isMenuOpen = false;
  isLoggedIn = false;
  currentUser: any = null;
  private authSub!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // ✅ This runs on every page load and updates isLoggedIn
    this.authSub = this.authService.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
      this.currentUser = status ? this.authService.getCurrentUser() : null;
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 100);
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }

  logout() {
    this.authService.clearSession();
    this.isMenuOpen = false;
  }
}