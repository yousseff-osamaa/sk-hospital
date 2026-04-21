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
  isLoggedIn = false; // Refers to Patient login
  isAdmin = false;    // Refers to Admin login
  currentUser: any = null;
  private authSub!: Subscription;
  private routerSub!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.syncState();

    // Listen for Patient Auth changes
    this.authSub = this.authService.isLoggedIn$.subscribe((status: boolean) => {
      this.syncState();
      this.cdr.detectChanges();
    });

    // Re-check state on navigation
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.syncState();
        this.cdr.detectChanges();
        // Refresh icons after navigation
        setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 100);
      });
  }

  private syncState() {
    this.isAdmin = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUser = this.isLoggedIn ? this.authService.getCurrentUser() : null;

    // Logic: If Admin is logged in, we treat the view as Guest+Admin 
    // and ignore the Patient specific navbar links.
    if (this.isAdmin) {
      // We keep isLoggedIn true for the service but UI logic will use !isPatient
    }
  }

  get isPatient(): boolean {
    // A user is a patient ONLY if logged in AND not an admin
    return this.isLoggedIn && !this.isAdmin;
  }

  logout() {
    if (this.isAdmin) {
      sessionStorage.removeItem('isAdminLoggedIn');
      this.isAdmin = false;
    } else {
      this.authService.clearSession();
    }
    this.isMenuOpen = false;
    this.router.navigate(['/']);
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 100);
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  skipToMain() {
    setTimeout(() => {
        const el = document.getElementById('main-content');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100); // small delay lets the route render first
    this.isMenuOpen = false;
}

  /**
   * Handle navbar clicks. If already on the same route (e.g. home) we
   * prevent navigation and scroll past the hero to the main content.
   * Also stop propagation so the slider/hero doesn't react to the click.
   */
  onNavClick(event: Event, path: string) {
    // close mobile menu immediately
    this.isMenuOpen = false;

    // Normalize current url (strip query/fragment)
    const current = this.router.url ? this.router.url.split('?')[0].split('#')[0] : '';

    if (current === path) {
      event.preventDefault();
      event.stopPropagation();
      this.skipToMain();
    }
    // otherwise allow routerLink to navigate normally
  }

}


