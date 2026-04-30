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
          <button type="submit" class="btn submit-btn" [disabled]="isSubmitting">
            {{ isSubmitting ? checkingLabel : getOtpLabel }}
          </button>
        </form>
        <div class="otp-box" *ngIf="otp">
          <p>{{ otpIntroLabel }}</p>
          <strong>{{ otp }}</strong>
          <small>{{ otpHintLabel }}</small>
          <button type="button" class="btn copy-btn" (click)="copyOtp()">{{ copyOtpLabel }}</button>
          <button type="button" class="btn submit-btn" (click)="goToReset()">{{ continueResetLabel }}</button>
        </div>
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
    .submit-btn:disabled { opacity: .6; cursor: not-allowed; }
    .otp-box { margin-top: 18px; padding: 16px; border-radius: 16px; background: rgba(180, 166, 206, .16); text-align: center; display: grid; gap: 8px; }
    .otp-box strong { font-size: 2rem; letter-spacing: .2em; color: var(--primary-accent); }
    .otp-box small { opacity: .75; }
    .copy-btn { background: rgba(255,255,255,.08); color: var(--text-color); }
    .extra-links { margin-top: 15px; text-align: center; }
    .extra-links a { color: var(--primary-accent); }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  otp = '';
  expiresInMinutes = 10;
  isSubmitting = false;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private router: Router,
    public translation: TranslationService
  ) {}

  onSubmit() {
    if (!this.email.trim()) {
      this.toastService.show(this.enterEmailLabel, 'error');
      return;
    }

    this.isSubmitting = true;
    this.http.post<any>(apiUrl('/api/auth/forgot-password'), { email: this.email }).subscribe({
      next: response => {
        this.otp = response.otp || response.Otp || '';
        this.expiresInMinutes = response.expiresInMinutes || response.ExpiresInMinutes || 10;
        this.toastService.show(response.message || this.otpGeneratedLabel, 'success');
        this.isSubmitting = false;
      },
      error: error => {
        this.isSubmitting = false;
        this.toastService.show(error?.error || this.translation.t('forgot.processingError'), 'error');
      }
    });
  }

  goToReset() {
    this.router.navigate(['/reset-password'], { queryParams: { email: this.email.trim() } });
  }

  async copyOtp() {
    try {
      await navigator.clipboard.writeText(this.otp);
      this.toastService.show(this.otpCopiedLabel, 'success');
    } catch {
      this.toastService.show(this.copyFailedLabel, 'error');
    }
  }

  get getOtpLabel(): string {
    return this.translation.isArabic ? 'إظهار رمز التحقق' : 'Get OTP';
  }

  get checkingLabel(): string {
    return this.translation.isArabic ? 'جاري التحقق...' : 'Checking...';
  }

  get enterEmailLabel(): string {
    return this.translation.isArabic ? 'يرجى إدخال البريد الإلكتروني.' : 'Please enter your email.';
  }

  get otpIntroLabel(): string {
    return this.translation.isArabic ? 'رمز إعادة تعيين كلمة المرور هو:' : 'Your reset OTP is:';
  }

  get otpHintLabel(): string {
    return this.translation.isArabic
      ? `ينتهي خلال ${this.expiresInMinutes} دقائق. أدخله في الصفحة التالية.`
      : `It expires in ${this.expiresInMinutes} minutes. Enter it on the next page.`;
  }

  get continueResetLabel(): string {
    return this.translation.isArabic ? 'المتابعة لإعادة تعيين كلمة المرور' : 'Continue to reset password';
  }

  get otpGeneratedLabel(): string {
    return this.translation.isArabic ? 'تم إنشاء رمز التحقق.' : 'OTP generated.';
  }

  get copyOtpLabel(): string {
    return this.translation.isArabic ? 'نسخ الرمز' : 'Copy OTP';
  }

  get otpCopiedLabel(): string {
    return this.translation.isArabic ? 'تم نسخ الرمز.' : 'OTP copied.';
  }

  get copyFailedLabel(): string {
    return this.translation.isArabic ? 'تعذر نسخ الرمز.' : 'Could not copy OTP.';
  }
}
