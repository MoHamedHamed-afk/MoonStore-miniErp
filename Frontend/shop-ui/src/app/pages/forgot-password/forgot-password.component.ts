import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { apiUrl } from '../../core/api.config';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="glass login-box">
        <h2>{{ translation.t('forgot.title') }}</h2>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="forgot-email">{{ translation.t('forgot.email') }}</label>
            <input id="forgot-email" type="email" [(ngModel)]="email" name="email" class="form-control" autocomplete="email" required>
          </div>
          <button type="submit" class="btn submit-btn">{{ translation.t('forgot.submit') }}</button>
        </form>
        <div class="extra-links">
          <a routerLink="/login">{{ translation.t('forgot.backToLogin') }}</a>
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
    .form-control { width: 100%; padding: 10px; border: 1px solid var(--glass-border); border-radius: 8px; background: transparent; color: var(--text-color); }
    .submit-btn { width: 100%; margin-top: 20px; }
    .extra-links { margin-top: 15px; text-align: center; }
    .extra-links a { color: var(--primary-accent); }
  `]
})
export class ForgotPasswordComponent {
  email = '';

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private router: Router,
    public translation: TranslationService
  ) {}

  onSubmit() {
    this.http.post<any>(apiUrl('/api/auth/forgot-password'), { email: this.email }).subscribe({
      next: response => {
        this.toastService.show(response.message, 'info');
        if (response.mockToken) {
          this.toastService.show(this.translation.t('forgot.mockSent'), 'success');
          setTimeout(() => this.router.navigate(['/reset-password'], { queryParams: { token: response.mockToken } }), 2000);
        }
      },
      error: () => this.toastService.show(this.translation.t('forgot.processingError'), 'error')
    });
  }
}
