import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Order, OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { assetUrl } from '../../core/api.config';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="orders-shell">
      <div class="orders-backdrop"></div>

      <div class="container orders-layout">
        <section class="glass orders-hero">
          <p class="eyebrow">{{ translation.t('myOrders.eyebrow') }}</p>
          <h1>{{ translation.t('myOrders.title') }}</h1>
          <p>{{ translation.t('myOrders.subtitle') }}</p>
        </section>

        <section class="orders-list">
          <div class="glass empty-state" *ngIf="isLoading">Loading your orders...</div>
          <div class="glass empty-state error-state" *ngIf="ordersError">
            {{ ordersError }}
            <button type="button" class="btn retry-btn" (click)="loadOrders()">Retry</button>
          </div>

          <div class="glass order-card" *ngFor="let order of orders">
            <div class="order-header">
              <div>
                <div class="order-label">Order #{{ order.id }}</div>
                <div class="order-date">{{ order.orderDate | date:'medium' }}</div>
              </div>
              <div
                class="order-status"
                [class.pending]="order.status === 'Pending'"
                [class.accepted]="order.status === 'Accepted'"
                [class.rejected]="order.status === 'Rejected'"
                [class.completed]="order.status === 'Completed'">
                {{ statusLabel(order.status) }}
              </div>
            </div>

            <div class="order-items">
              <div class="item-row" *ngFor="let item of order.items">
                <img [src]="getImgUrl(item.productImageUrl)" [alt]="item.productName">
                <div class="item-copy">
                  <strong>{{ item.productName }}</strong>
                  <span>{{ translation.t('myOrders.qtyPrice', { quantity: item.quantity, price: item.unitPrice }) }}</span>
                  <span class="variant-line" *ngIf="item.selectedSize || item.selectedColor">
                    <ng-container *ngIf="item.selectedSize">Size {{ item.selectedSize }}</ng-container>
                    <ng-container *ngIf="item.selectedSize && item.selectedColor"> · </ng-container>
                    <ng-container *ngIf="item.selectedColor">Color {{ item.selectedColor }}</ng-container>
                  </span>
                </div>
              </div>
            </div>

            <div class="order-footer">
              <div class="order-meta">
                <span>{{ order.storeName || ('Store #' + order.storeId) }}</span>
                <span *ngIf="order.phoneNumber">{{ order.phoneNumber }}</span>
                <span *ngIf="order.paymentMethod">{{ formatPaymentMethod(order.paymentMethod) }}</span>
                <span>{{ order.address }}</span>
                <strong>\${{ order.totalAmount }}</strong>
              </div>

              <div class="order-actions">
                <button
                  *ngIf="order.status === 'Pending'"
                  class="btn cancel-btn"
                  (click)="cancelOrder(order.id!)">
                  {{ translation.t('myOrders.cancel') }}
                </button>
              </div>
            </div>
          </div>

          <div class="glass empty-state" *ngIf="!isLoading && !ordersError && orders.length === 0">
            {{ translation.t('myOrders.empty') }}
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .orders-shell { position: relative; min-height: 100vh; padding: 120px 0 40px; overflow: hidden; }
    .orders-backdrop { position: absolute; inset: 0; z-index: -1; background:
      radial-gradient(circle at 20% 20%, rgba(112, 89, 192, 0.24), transparent 28%),
      radial-gradient(circle at 80% 18%, rgba(52, 129, 196, 0.18), transparent 26%),
      radial-gradient(circle at 50% 80%, rgba(255,255,255,.10), transparent 32%),
      linear-gradient(180deg, #05070f 0%, #0b1020 48%, #080b14 100%); }
    :host-context(body:not(.dark)) .orders-backdrop { background:
      radial-gradient(circle at 20% 20%, rgba(189,166,206,.32), transparent 28%),
      radial-gradient(circle at 80% 18%, rgba(180,211,217,.38), transparent 26%),
      radial-gradient(circle at 50% 80%, rgba(255,255,255,.42), transparent 32%),
      linear-gradient(180deg, #fcfbff 0%, #edf3fa 45%, #f4ede5 100%); }
    .orders-layout { display: grid; gap: 22px; }
    .orders-hero, .order-card, .empty-state { border-radius: 28px; }
    .orders-hero { padding: 30px; }
    .eyebrow { text-transform: uppercase; letter-spacing: .18em; font-size: .8rem; margin-bottom: 12px; color: var(--secondary-accent); font-weight: 700; }
    .orders-hero h1 { font-size: clamp(2rem, 4vw, 3.3rem); margin-bottom: 10px; }
    .orders-list { display: grid; gap: 18px; }
    .order-card { padding: 24px; }
    .order-header, .order-footer { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
    .order-header { margin-bottom: 18px; }
    .order-label { font-weight: 800; font-size: 1.1rem; }
    .order-date { opacity: .7; font-size: .92rem; }
    .order-status { padding: 8px 14px; border-radius: 999px; font-weight: 700; font-size: .85rem; }
    .pending { background: rgba(241,196,15,.18); color: #f1c40f; }
    .accepted { background: rgba(52,152,219,.16); color: #4ea6db; }
    .rejected { background: rgba(255,107,107,.16); color: #ff6b6b; }
    .completed { background: rgba(46,204,113,.16); color: #44d486; }
    .order-items { display: grid; gap: 12px; margin-bottom: 18px; }
    .item-row { display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 18px; background: rgba(255,255,255,.05); }
    .item-row img { width: 58px; height: 58px; object-fit: contain; border-radius: 14px; background: rgba(255,255,255,.05); padding: 6px; }
    .item-copy { display: flex; flex-direction: column; gap: 4px; }
    .item-copy span { opacity: .72; font-size: .92rem; }
    .variant-line { color: var(--secondary-accent); }
    .order-footer { padding-top: 14px; border-top: 1px solid rgba(255,255,255,.08); align-items: flex-start; }
    .order-meta { display: grid; gap: 8px; }
    .order-meta span { opacity: .78; }
    .order-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn { border: none; border-radius: 999px; padding: 11px 18px; font-weight: 700; cursor: pointer; color: #fff; }
    .cancel-btn { background: linear-gradient(135deg, #ff6b6b, #ff4757); }
    .return-btn { background: linear-gradient(135deg, #8f7cff, #5f7cff); }
    .empty-state { padding: 30px; text-align: center; }
    .error-state { color: #ff8d99; display: grid; justify-items: center; gap: 14px; }
    .retry-btn { background: linear-gradient(135deg, var(--primary-accent), var(--secondary-accent)); }
    @media (max-width: 640px) {
      .orders-shell { padding-top: 96px; }
      .orders-layout { gap: 16px; }
      .orders-hero, .order-card, .empty-state { border-radius: 22px; }
      .orders-hero { padding: 20px; }
      .orders-hero h1 { font-size: clamp(2rem, 11vw, 2.55rem); }
      .order-card { padding: 16px; }
      .order-header, .order-footer { flex-direction: column; align-items: flex-start; }
      .order-status { align-self: flex-start; }
      .item-row { align-items: flex-start; gap: 12px; padding: 10px; }
      .item-row img { width: 52px; height: 52px; flex: 0 0 auto; }
      .item-copy { min-width: 0; }
      .item-copy strong, .order-meta span { overflow-wrap: anywhere; }
      .order-meta { width: 100%; }
      .order-actions { width: 100%; }
      .order-actions .btn { width: 100%; min-height: 46px; }
      .retry-btn { width: 100%; min-height: 46px; }
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  ordersError = '';

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router,
    private toastService: ToastService,
    public translation: TranslationService
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.ordersError = '';
    this.orderService.getMyOrders().subscribe({
      next: data => {
        this.orders = data;
        this.isLoading = false;
      },
      error: () => {
        this.ordersError = 'Could not load your orders. Please try again.';
        this.isLoading = false;
      }
    });
  }

  cancelOrder(id: number) {
    this.orderService.cancelMyOrder(id).subscribe({
      next: () => {
        this.toastService.show(this.translation.t('myOrders.actions.cancelSuccess'), 'success');
        this.loadOrders();
      },
      error: () => this.toastService.show(this.translation.t('myOrders.actions.cancelFailed'), 'error')
    });
  }

  requestReturn(id: number) {
    this.orderService.requestReturn(id).subscribe({
      next: () => {
        this.toastService.show(this.translation.t('myOrders.actions.returnRequested'), 'success');
        this.loadOrders();
      },
      error: () => this.toastService.show(this.translation.t('myOrders.actions.returnFailed'), 'error')
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: 'Pending',
      Accepted: 'Accepted',
      Rejected: 'Rejected',
      Completed: 'Completed'
    };
    return labels[status] || status;
  }

  formatPaymentMethod(paymentMethod?: string): string {
    if (!paymentMethod || paymentMethod === 'CashOnDelivery') {
      return 'Cash on delivery';
    }

    return paymentMethod;
  }

  getImgUrl(url: string | undefined): string {
    if (!url) return 'assets/images/placeholder.png';
    if (url.startsWith('http') || url.startsWith('assets/')) return url;
    return assetUrl(url);
  }
}
