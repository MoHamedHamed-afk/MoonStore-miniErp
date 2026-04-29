import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartItem, CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { assetUrl } from '../../core/api.config';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container" style="padding-top: 120px; min-height: 100vh;">
      <h1 style="font-size: 3rem; margin-bottom: 40px;">{{ translation.t('cart.title') }}</h1>

      <div class="glass" *ngIf="isLoading" style="padding: 22px; border-radius: 16px; text-align: center;">Loading cart...</div>
      <div class="glass" *ngIf="cartError" style="padding: 22px; border-radius: 16px; text-align: center; color: #ff8d99;">
        {{ cartError }}
        <button type="button" class="btn" style="margin-left: 12px; padding: 8px 16px;" (click)="loadCart()">Retry</button>
      </div>

      <div *ngIf="!isLoading && !cartError && cartItems.length === 0">{{ translation.t('cart.empty') }}</div>

      <div *ngIf="!isLoading && !cartError && cartItems.length > 0">
        <div class="glass" *ngFor="let item of cartItems; trackBy: trackByCartItemId" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-radius: 16px; margin-bottom: 20px; gap: 16px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 20px;">
             <img [src]="getImgUrl(item.product?.imageUrl)" [alt]="item.product?.name || 'Cart product'" loading="lazy" decoding="async" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
             <div>
               <h3 style="font-size: 1.2rem;">{{ item.product?.name }}</h3>
               <p style="opacity: 0.8;">\${{ item.unitPrice || item.product?.price }}</p>
               <p style="opacity: 0.68; font-size: .85rem;" *ngIf="item.selectedSize || item.selectedColor">
                 {{ item.selectedSize || '-' }} / {{ item.selectedColor || '-' }}
               </p>
             </div>
          </div>
          <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
            <button type="button" class="btn" style="padding: 5px 15px;" (click)="updateQty(item, -1)" [attr.aria-label]="'Decrease quantity for ' + (item.product?.name || 'product')">-</button>
            <span style="font-size: 1.2rem; font-weight: bold;">{{ item.quantity }}</span>
            <button type="button" class="btn" style="padding: 5px 15px;" (click)="updateQty(item, 1)" [attr.aria-label]="'Increase quantity for ' + (item.product?.name || 'product')">+</button>
            <button type="button" class="btn" style="background: #ff4757; padding: 10px;" (click)="removeItem(item.id)">{{ translation.t('common.remove') }}</button>
          </div>
        </div>

        <div class="glass" style="margin-top: 40px; padding: 30px; border-radius: 16px; text-align: right;">
          <h2 style="font-size: 2rem; margin-bottom: 20px;">{{ translation.t('cart.total') }}: <span style="color: var(--primary-accent);">\${{ getTotal() }}</span></h2>
          <div style="display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap;">
            <button type="button" class="btn" style="padding: 15px 24px; background: #ff4757;" (click)="clearCart()">{{ translation.t('common.removeAll') }}</button>
            <button type="button" class="btn" style="padding: 15px 40px; font-size: 1.2rem;" (click)="checkout()">{{ translation.t('cart.proceed') }}</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  isLoading = false;
  cartError = '';

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private toastService: ToastService,
    public translation: TranslationService
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadCart();
  }

  loadCart() {
    this.isLoading = true;
    this.cartError = '';
    this.cartService.getCart().subscribe({
      next: data => {
        this.cartItems = data;
        this.isLoading = false;
      },
      error: () => {
        this.cartError = 'Could not load your cart. Please try again.';
        this.isLoading = false;
      }
    });
  }

  getImgUrl(url: string | undefined): string {
    if (!url) return 'assets/images/placeholder.png';
    if (url.startsWith('http') || url.startsWith('assets/')) return url;
    return assetUrl(url);
  }

  updateQty(item: CartItem, change: number) {
    const newQty = item.quantity + change;
    if (newQty > 0) {
      this.cartService.updateQuantity(item.id, newQty).subscribe({
        next: () => this.loadCart(),
        error: error => this.toastService.show(
          this.cartService.getUserFacingError(error, this.translation.t('product.loginRequired')),
          'error'
        )
      });
    } else {
      this.removeItem(item.id);
    }
  }

  removeItem(id: number) {
    this.cartService.removeFromCart(id).subscribe({
      next: () => this.loadCart(),
      error: () => this.toastService.show('Could not remove this item.', 'error')
    });
  }

  clearCart() {
    this.cartService.clearCart().subscribe({
      next: () => this.loadCart(),
      error: () => this.toastService.show('Could not clear the cart.', 'error')
    });
  }

  getTotal() {
    return this.cartItems.reduce((acc, item) => acc + (item.unitPrice || item.product?.price || 0) * item.quantity, 0);
  }

  checkout() {
    this.router.navigate(['/shipping']);
  }

  trackByCartItemId(_: number, item: CartItem): number {
    return item.id;
  }
}
