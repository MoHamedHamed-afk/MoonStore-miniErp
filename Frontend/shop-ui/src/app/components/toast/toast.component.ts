import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" class="toast glass" [ngClass]="toast.type">
        <span>{{ toast.message }}</span>
        <button (click)="remove(toast.id)">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      padding: 15px 25px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      animation: slideIn 0.3s ease-out forwards;
      font-weight: 600;
      min-width: 250px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .toast.success { border-left: 5px solid #51cf66; }
    .toast.error { border-left: 5px solid #ff6b6b; }
    .toast.info { border-left: 5px solid var(--primary-accent); }
    button {
      background: none;
      border: none;
      color: inherit;
      font-size: 1.2rem;
      cursor: pointer;
      opacity: 0.7;
    }
    button:hover { opacity: 1; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toasts: ToastMessage[] = [];

  constructor(private toastService: ToastService) {
    this.toastService.toasts$.subscribe(t => this.toasts = t);
  }

  remove(id: number) {
    this.toastService.remove(id);
  }
}
