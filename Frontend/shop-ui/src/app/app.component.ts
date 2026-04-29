import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from './services/auth.service';
import { ToastComponent } from './components/toast/toast.component';
import { ToastService } from './services/toast.service';
import { TranslationService } from './services/translation.service';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'shop-ui';
  isDarkMode = true;
  currentUser: User | null = null;
  showWelcome = false;
  isMobileMenuOpen = false;
  showBrandIntro = false;
  private readonly introStorageKey = 'moon-store-intro-seen';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    public translation: TranslationService,
    private seoService: SeoService
  ) {
    this.applyTheme();
  }

  ngOnInit() {
    this.initBrandIntro();
    this.seoService.watchRouteChanges();

    this.authService.currentUser$.subscribe(user => {
      const wasLoggedOut = !this.currentUser && user;
      this.currentUser = user;
      if (!user) {
        this.isMobileMenuOpen = false;
      }
      
      if (wasLoggedOut && user?.role !== 'Admin') {
        this.showWelcome = true;
        setTimeout(() => {
          this.showWelcome = false;
        }, 3000);
      }
    });
  }

  get shouldShowAppNavbar(): boolean {
    return !this.router.url.startsWith('/admin');
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  private initBrandIntro() {
    if (typeof window === 'undefined') {
      return;
    }

    const alreadySeen = sessionStorage.getItem(this.introStorageKey) === 'true';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (alreadySeen || prefersReducedMotion) {
      return;
    }

    this.showBrandIntro = true;
    sessionStorage.setItem(this.introStorageKey, 'true');

    window.setTimeout(() => {
      this.showBrandIntro = false;
    }, 850);
  }

  logout() {
    this.authService.logout();
    this.closeMobileMenu();
    this.toastService.show(this.translation.t('toast.logout'), 'info');
    this.router.navigate(['/login']);
  }
}
