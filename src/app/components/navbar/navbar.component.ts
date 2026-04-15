import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
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
  isAdmin = false;
  currentUser: any = null;
  private authSub!: Subscription;
  private routerSub!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Initial check
    this.syncState();

    // Re-sync whenever patient auth state changes
    this.authSub = this.authService.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
      this.currentUser = status ? this.authService.getCurrentUser() : null;
      // Re-read sessionStorage — saveSession() already cleared it if a patient just logged in
      this.isAdmin = sessionStorage.getItem('isAdminLoggedIn') === 'true';
      this.cdr.detectChanges();
    });

    // Re-check admin state on every route change as a safety net.
    // This catches edge cases where sessionStorage changes without triggering isLoggedIn$.
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        const wasAdmin = this.isAdmin;
        this.syncState();
        if (wasAdmin !== this.isAdmin) {
          this.cdr.detectChanges();
        }
      });
  }

  /** Read both localStorage (patient) and sessionStorage (admin) atomically */
  private syncState() {
    this.isAdmin = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUser = this.isLoggedIn ? this.authService.getCurrentUser() : null;

    // Guard: if somehow both are true, patient takes no precedence —
    // instead we trust that saveSession() already cleared admin session,
    // so if isAdmin is still true here, a real admin IS active.
    // If isLoggedIn is also true, that means stale localStorage — clear it.
    if (this.isAdmin && this.isLoggedIn) {
      // Admin session wins; patient localStorage was left from a previous session
      this.authService.clearSession();
      this.isLoggedIn = false;
      this.currentUser = null;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 100);
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  get isPatient(): boolean {
    return this.isLoggedIn && !this.isAdmin && !this.currentUser?.username;
  }

  logout() {
    if (this.isAdmin) {
      sessionStorage.removeItem('isAdminLoggedIn');
      this.isAdmin = false;
      this.cdr.detectChanges();
      this.router.navigate(['/']);
    } else {
      this.authService.clearSession(); // this also clears sessionStorage now
    }
    this.isMenuOpen = false;
  }
}