import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <nav class="glass navbar" style="position: absolute; top: 20px;">
        <div class="container nav-content">
          <div class="logo">{{ translation.t('nav.brand') }}</div>
          <div class="nav-links"><a routerLink="/">{{ translation.t('common.backToHome') }}</a></div>
        </div>
      </nav>

      <div class="glass login-box">
        <h2>{{ translation.t('login.title') }}</h2>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="login-username">{{ translation.t('login.username') }}</label>
            <input id="login-username" type="text" [(ngModel)]="credentials.username" name="username" class="form-control" autocomplete="username" required>
          </div>

          <div class="form-group">
            <label for="login-password">{{ translation.t('login.password') }}</label>
            <div class="password-field">
              <input id="login-password" [type]="showPassword ? 'text' : 'password'" [(ngModel)]="credentials.password" name="password" class="form-control" autocomplete="current-password" required>
              <button
                type="button"
                class="toggle-password"
                (click)="showPassword = !showPassword"
                [attr.aria-label]="showPassword ? translation.t('login.hidePassword') : translation.t('login.showPassword')">
                {{ showPassword ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <div class="error" *ngIf="error">{{ error }}</div>
          <button type="submit" class="btn submit-btn">{{ translation.t('login.submit') }}</button>
        </form>

        <div class="extra-links">
          <a routerLink="/forgot-password">{{ translation.t('login.forgotPassword') }}</a>
          <a routerLink="/register" class="accent">{{ translation.t('login.registerPrompt') }}</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-color);
    }
    .login-box {
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }
    h2 { margin-bottom: 20px; text-align: center; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: 600; }
    .password-field { position: relative; }
    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      background: transparent;
      color: var(--text-color);
    }
    .toggle-password {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
    }
    :host-context([dir='rtl']) .toggle-password { right: auto; left: 10px; }
    .submit-btn { width: 100%; margin-top: 20px; }
    .extra-links { margin-top: 15px; text-align: center; display: flex; flex-direction: column; gap: 10px; }
    .extra-links a:first-child { color: var(--secondary-accent); font-size: 0.9rem; }
    .extra-links .accent { color: var(--primary-accent); }
    .error { color: #ff6b6b; margin-top: 10px; font-size: 0.9rem; text-align: center; }
  `]
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  error = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    public translation: TranslationService
  ) {}

  onSubmit() {
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.toastService.show(this.translation.t('login.success'), 'success');
        const user = this.authService.getCurrentUser();
        this.router.navigate([user?.role === 'Admin' ? '/admin' : '/']);
      },
      error: () => {
        this.error = this.translation.t('login.invalidCredentials');
        this.toastService.show(this.error, 'error');
      }
    });
  }
}
