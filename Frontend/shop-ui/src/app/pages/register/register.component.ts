import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="glass login-box">
        <h2>{{ translation.t('register.title') }}</h2>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>{{ translation.t('register.username') }}</label>
            <input type="text" [(ngModel)]="credentials.username" name="username" class="form-control" required>
          </div>

          <div class="form-group">
            <label>{{ translation.t('register.email') }}</label>
            <input type="email" [(ngModel)]="credentials.email" name="email" class="form-control" required>
          </div>

          <div class="form-group">
            <label>{{ translation.t('register.phone') }}</label>
            <input type="text" [(ngModel)]="credentials.phoneNumber" name="phoneNumber" class="form-control">
          </div>

          <div class="form-group">
            <label>{{ translation.t('register.password') }}</label>
            <div class="password-field">
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="credentials.password" name="password" class="form-control" required>
              <button
                type="button"
                class="toggle-password"
                (click)="showPassword = !showPassword"
                [attr.aria-label]="showPassword ? translation.t('register.hidePassword') : translation.t('register.showPassword')">
                {{ showPassword ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <div class="error" *ngIf="error">{{ error }}</div>
          <button type="submit" class="btn submit-btn">{{ translation.t('register.submit') }}</button>
        </form>

        <div class="extra-links">
          <a routerLink="/login" class="accent">{{ translation.t('register.loginPrompt') }}</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container { height: 100vh; display: flex; align-items: center; justify-content: center; }
    .login-box { padding: 40px; width: 100%; max-width: 400px; }
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
    .extra-links { margin-top: 15px; text-align: center; }
    .extra-links .accent { color: var(--primary-accent); }
    .error { color: #ff6b6b; margin-top: 10px; font-size: 0.9rem; text-align: center; }
  `]
})
export class RegisterComponent {
  credentials = { username: '', password: '', email: '', phoneNumber: '' };
  error = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    public translation: TranslationService
  ) {}

  onSubmit() {
    this.authService.register(this.credentials).subscribe({
      next: () => {
        this.toastService.show(this.translation.t('register.success'), 'success');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: () => {
        this.error = this.translation.t('register.failed');
        this.toastService.show(this.error, 'error');
      }
    });
  }
}
