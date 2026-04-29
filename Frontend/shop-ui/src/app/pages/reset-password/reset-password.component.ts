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
            <label for="reset-new-password">{{ translation.t('reset.newPassword') }}</label>
            <input id="reset-new-password" type="password" [(ngModel)]="newPassword" name="newPassword" class="form-control" autocomplete="new-password" required>
          </div>
          <button type="submit" class="btn submit-btn">{{ translation.t('reset.submit') }}</button>
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
  `]
})
export class ResetPasswordComponent implements OnInit {
  newPassword = '';
  token = '';

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    public translation: TranslationService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  onSubmit() {
    this.http.post<any>(apiUrl('/api/auth/reset-password'), { token: this.token, newPassword: this.newPassword }).subscribe({
      next: response => {
        this.toastService.show(response.message, 'success');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: error => this.toastService.show(error.error || this.translation.t('reset.failed'), 'error')
    });
  }
}
