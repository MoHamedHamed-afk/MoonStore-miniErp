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
          <div class="glass order-card" *ngFor="let order of orders">
            <div class="order-header">
              <div>
                <div class="order-label">Order #{{ order.id }}</div>
                <div class="order-date">{{ order.orderDate | date:'medium' }}</div>
              </div>
              <div
                class="order-status"
                [class.pending]="order.status === 'Pending'"
                [class.shipped]="order.status === 'Shipped'"
                [class.delivered]="order.status === 'Delivered'"
                [class.cancelled]="order.status === 'Cancelled'"
                [class.return-requested]="order.status === 'ReturnRequested'"
                [class.refunded]="order.status === 'Refunded'">
                {{ translation.t('status.' + order.status) }}
              </div>
            </div>

            <div class="order-items">
              <div class="item-row" *ngFor="let item of order.items">
                <img [src]="getImgUrl(item.productImageUrl)" [alt]="item.productName">
                <div class="item-copy">
                  <strong>{{ item.productName }}</strong>
                  <span>{{ translation.t('myOrders.qtyPrice', { quantity: item.quantity, price: item.unitPrice }) }}</span>
                </div>
              </div>
            </div>

            <div class="order-footer">
              <div class="order-meta">
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
                <button
                  *ngIf="order.status === 'Delivered'"
                  class="btn return-btn"
                  (click)="requestReturn(order.id!)">
                  {{ translation.t('myOrders.requestReturn') }}
                </button>
              </div>
            </div>
          </div>

          <div class="glass empty-state" *ngIf="orders.length === 0">
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
    .shipped { background: rgba(52,152,219,.16); color: #4ea6db; }
    .delivered { background: rgba(46,204,113,.16); color: #44d486; }
    .cancelled { background: rgba(255,107,107,.16); color: #ff6b6b; }
    .return-requested { background: rgba(155,142,199,.18); color: #b8a8f5; }
    .refunded { background: rgba(111,230,183,.16); color: #57d8a3; }
    .order-items { display: grid; gap: 12px; margin-bottom: 18px; }
    .item-row { display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 18px; background: rgba(255,255,255,.05); }
    .item-row img { width: 58px; height: 58px; object-fit: contain; border-radius: 14px; background: rgba(255,255,255,.05); padding: 6px; }
    .item-copy { display: flex; flex-direction: column; gap: 4px; }
    .item-copy span { opacity: .72; font-size: .92rem; }
    .order-footer { padding-top: 14px; border-top: 1px solid rgba(255,255,255,.08); align-items: flex-start; }
    .order-meta { display: grid; gap: 8px; }
    .order-meta span { opacity: .78; }
    .order-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn { border: none; border-radius: 999px; padding: 11px 18px; font-weight: 700; cursor: pointer; color: #fff; }
    .cancel-btn { background: linear-gradient(135deg, #ff6b6b, #ff4757); }
    .return-btn { background: linear-gradient(135deg, #8f7cff, #5f7cff); }
    .empty-state { padding: 30px; text-align: center; }
    @media (max-width: 640px) {
      .orders-shell { padding-top: 96px; }
      .order-header, .order-footer { flex-direction: column; align-items: flex-start; }
      .order-actions { width: 100%; }
      .order-actions .btn { width: 100%; }
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];

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
    this.orderService.getMyOrders().subscribe(data => this.orders = data);
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

  getImgUrl(url: string | undefined): string {
    if (!url) return 'assets/images/placeholder.png';
    if (url.startsWith('http') || url.startsWith('assets/')) return url;
    return assetUrl(url);
  }
}
