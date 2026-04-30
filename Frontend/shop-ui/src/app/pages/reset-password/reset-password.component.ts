import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { apiUrl } from '../../core/api.config';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="glass login-box">
        <h2>{{ translation.t('reset.title') }}</h2>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="reset-email">{{ emailLabel }}</label>
            <input id="reset-email" type="email" [(ngModel)]="email" name="email" class="form-control" autocomplete="email" required>
          </div>
          <div class="form-group">
            <label for="reset-otp">{{ otpLabel }}</label>
            <input id="reset-otp" type="text" inputmode="numeric" maxlength="6" [(ngModel)]="otp" name="otp" class="form-control" autocomplete="one-time-code" required>
          </div>
          <div class="form-group">
            <label for="reset-new-password">{{ translation.t('reset.newPassword') }}</label>
            <input id="reset-new-password" type="password" [(ngModel)]="newPassword" name="newPassword" class="form-control" autocomplete="new-password" required>
          </div>
          <div class="form-group">
            <label for="reset-confirm-password">{{ confirmPasswordLabel }}</label>
            <input id="reset-confirm-password" type="password" [(ngModel)]="confirmPassword" name="confirmPassword" class="form-control" autocomplete="new-password" required>
          </div>
          <button type="submit" class="btn submit-btn" [disabled]="isSubmitting">
            {{ isSubmitting ? resettingLabel : translation.t('reset.submit') }}
          </button>
        </form>
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
  `]
})
export class ResetPasswordComponent implements OnInit {
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  isSubmitting = false;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    public translation: TranslationService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  onSubmit() {
    if (!this.email.trim()) {
      this.toastService.show(this.enterEmailLabel, 'error');
      return;
    }

    if (!this.otp.trim()) {
      this.toastService.show(this.enterOtpLabel, 'error');
      return;
    }

    if (this.newPassword.length < 6) {
      this.toastService.show(this.passwordMinLabel, 'error');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastService.show(this.passwordMismatchLabel, 'error');
      return;
    }

    this.isSubmitting = true;
    this.http.post<any>(apiUrl('/api/auth/reset-password'), {
      email: this.email,
      otp: this.otp,
      newPassword: this.newPassword
    }).subscribe({
      next: response => {
        this.toastService.show(response.message, 'success');
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: error => {
        this.isSubmitting = false;
        this.toastService.show(error?.error || this.translation.t('reset.failed'), 'error');
      }
    });
  }

  get emailLabel(): string {
    return this.translation.isArabic ? 'البريد الإلكتروني' : 'Email';
  }

  get otpLabel(): string {
    return this.translation.isArabic ? 'رمز التحقق' : 'OTP';
  }

  get confirmPasswordLabel(): string {
    return this.translation.isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password';
  }

  get resettingLabel(): string {
    return this.translation.isArabic ? 'جاري إعادة التعيين...' : 'Resetting...';
  }

  get enterEmailLabel(): string {
    return this.translation.isArabic ? 'يرجى إدخال البريد الإلكتروني.' : 'Please enter your email.';
  }

  get enterOtpLabel(): string {
    return this.translation.isArabic ? 'يرجى إدخال رمز التحقق.' : 'Please enter the OTP.';
  }

  get passwordMinLabel(): string {
    return this.translation.isArabic ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.' : 'Password must be at least 6 characters.';
  }

  get passwordMismatchLabel(): string {
    return this.translation.isArabic ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.';
  }
}
