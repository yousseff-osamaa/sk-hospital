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
    ).subscribe(() => {
      // Smooth scroll to top on every route change
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Re-init Lucide icons AFTER Angular finishes rendering the new route
      // Use two ticks: first for Angular DOM update, second for Lucide
      setTimeout(() => {
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }, 150);
    });
  }
}

