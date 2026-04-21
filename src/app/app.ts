import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SliderComponent } from './components/slider/slider';
import { FooterComponent } from './components/footer/footer.component';
import { filter } from 'rxjs/operators';

declare var lucide: any;

@Component({
  selector: 'app-root',
  standalone: true,
 imports: [RouterOutlet, NavbarComponent, FooterComponent, SliderComponent],
template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <app-slider></app-slider> 
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    .main-content {
      min-height: 80vh;
    }
  `]
})
export class App implements OnInit {
  protected readonly title = signal('hospital-app');

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      
      // Home Page Logic (Home Restoration)
      if (url === '/' || url === '/home') {
        window.scrollTo(0, 0);
      } else {
        // Skip-Hero Behavior for Sub-Pages
        setTimeout(() => {
          // Target Section Identification
          const targetIds = ['eventsList', 'contactForm', 'hospitalNews'];
          let element = null;
          
          for (const id of targetIds) {
            const found = document.getElementById(id);
            if (found) {
              element = found;
              break;
            }
          }

          // Fallback to router-outlet or main content container
          if (!element) {
            element = document.querySelector('router-outlet') || document.querySelector('.main-content');
          }

          if (element) {
            // Dynamic Offset Calculation (-100px for Navbar)
            const yOffset = -100;
            const rect = element.getBoundingClientRect();
            const y = rect.top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 150);
      }

      // Re-init Lucide icons AFTER Angular finishes rendering
      setTimeout(() => {
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }, 150);
    });
  }
}

