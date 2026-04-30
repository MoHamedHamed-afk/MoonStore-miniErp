import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartItem, CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { assetUrl } from '../../core/api.config';
import * as THREE from 'three';

@Component({
  selector: 'app-shipping',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="shipping-shell">
      <div class="shipping-backdrop">
        <div class="space-canvas" #shippingStars></div>
        <div class="moon-orbit">
          <div class="moon"></div>
        </div>
      </div>

      <div class="container shipping-layout">
        <section class="shipping-visual glass">
          <div class="visual-aura"></div>
          <div class="visual-carousel" aria-hidden="true">
            <img
              *ngFor="let image of carouselImages; let i = index"
              class="visual-model"
              [class.active]="i === activeVisualIndex"
              [class.previous]="i === previousVisualIndex"
              [src]="image"
              alt=""
            >
          </div>

          <div class="visual-copy">
            <p class="eyebrow">{{ translation.t('shipping.eyebrow') }}</p>
            <h2>{{ translation.t('shipping.title') }}</h2>
            <p>{{ translation.t('shipping.subtitle') }}</p>
          </div>
        </section>

        <section class="glass shipping-card">
          <h2>{{ translation.t('shipping.heading') }}</h2>

          <div class="payment-note" *ngIf="!success">
            <strong>Cash on delivery</strong>
            <span>No online card payment is required now. The shop will manually confirm your order and collect payment on delivery.</span>
          </div>

          <form #shippingForm="ngForm" (ngSubmit)="onSubmit(shippingForm)" *ngIf="!success" novalidate>
            <div class="form-grid">
              <div class="field full">
                <label for="shipping-name">{{ translation.t('shipping.fullName') }}</label>
                <input id="shipping-name" type="text" [(ngModel)]="form.name" name="name" #name="ngModel" autocomplete="name" required minlength="3">
                <small class="error-text" *ngIf="name.invalid && name.touched">{{ translation.t('shipping.errors.fullName') }}</small>
              </div>

              <div class="field">
                <label for="shipping-email">{{ translation.t('shipping.email') }}</label>
                <input id="shipping-email" type="email" [(ngModel)]="form.email" name="email" #email="ngModel" autocomplete="email" required email>
                <small class="error-text" *ngIf="email.invalid && email.touched">{{ translation.t('shipping.errors.email') }}</small>
              </div>

              <div class="field">
                <label for="shipping-phone">{{ translation.t('shipping.phone') }}</label>
                <input id="shipping-phone" type="tel" [(ngModel)]="form.phone" name="phone" #phone="ngModel" autocomplete="tel" required pattern="^\\+?[0-9\\s\\-]{8,}$" placeholder="+20 1X XXX XXXX">
                <small class="error-text" *ngIf="phone.invalid && phone.touched">{{ translation.t('shipping.errors.phone') }}</small>
              </div>

              <div class="field">
                <label for="shipping-city">{{ translation.t('shipping.city') }}</label>
                <input id="shipping-city" type="text" [(ngModel)]="form.city" name="city" #city="ngModel" autocomplete="address-level2" required>
                <small class="error-text" *ngIf="city.invalid && city.touched">{{ translation.t('shipping.errors.city') }}</small>
              </div>

              <div class="field">
                <label for="shipping-area">{{ translation.t('shipping.area') }}</label>
                <input id="shipping-area" type="text" [(ngModel)]="form.area" name="area" #area="ngModel" autocomplete="address-level3" required>
                <small class="error-text" *ngIf="area.invalid && area.touched">{{ translation.t('shipping.errors.area') }}</small>
              </div>

              <div class="field full">
                <label for="shipping-address">{{ translation.t('shipping.street') }}</label>
                <textarea id="shipping-address" [(ngModel)]="form.address" name="address" #address="ngModel" autocomplete="street-address" required rows="3"></textarea>
                <small class="error-text" *ngIf="address.invalid && address.touched">{{ translation.t('shipping.errors.street') }}</small>
              </div>

              <div class="field">
                <label for="shipping-apartment">{{ translation.t('shipping.apartment') }}</label>
                <input id="shipping-apartment" type="text" [(ngModel)]="form.apartment" name="apartment" #apartment="ngModel" autocomplete="address-line2" required>
                <small class="error-text" *ngIf="apartment.invalid && apartment.touched">{{ translation.t('shipping.errors.apartment') }}</small>
              </div>

              <div class="field">
                <label for="shipping-postal">{{ translation.t('shipping.postal') }}</label>
                <input id="shipping-postal" type="text" [(ngModel)]="form.postalCode" name="postalCode" #postalCode="ngModel" autocomplete="postal-code" required pattern="^[A-Za-z0-9\\-\\s]{4,10}$">
                <small class="error-text" *ngIf="postalCode.invalid && postalCode.touched">{{ translation.t('shipping.errors.postal') }}</small>
              </div>
            </div>

            <div class="variant-section" *ngIf="cartItems.length">
              <div class="variant-heading">
                <span>Choose size and color</span>
                <small>These choices will be saved with your order.</small>
              </div>

              <div class="variant-card" *ngFor="let item of cartItems">
                <img [src]="getImgUrl(item.product?.imageUrl)" [alt]="item.product?.name || 'Product'">
                <div class="variant-copy">
                  <strong>{{ item.product?.name }}</strong>
                  <span>Qty {{ item.quantity }} · {{ item.unitPrice || item.product?.price || 0 }} EGP</span>
                </div>
                <label *ngIf="item.product?.sizes?.length">
                  Size
                  <select
                    [ngModel]="item.selectedSize || item.product?.sizes?.[0]"
                    (ngModelChange)="item.selectedSize = $event"
                    [name]="'size_' + item.id"
                    required>
                    <option *ngFor="let size of item.product?.sizes" [value]="size">{{ size }}</option>
                  </select>
                </label>
                <label *ngIf="item.product?.colors?.length">
                  Color
                  <select
                    [ngModel]="item.selectedColor || item.product?.colors?.[0]"
                    (ngModelChange)="item.selectedColor = $event"
                    [name]="'color_' + item.id"
                    required>
                    <option *ngFor="let color of item.product?.colors" [value]="color">{{ color }}</option>
                  </select>
                </label>
              </div>
            </div>

            <div class="order-summary">
              <span>{{ translation.t('shipping.orderTotal') }}</span>
              <strong>{{ totalAmount }} EGP</strong>
            </div>

            <button type="submit" class="btn submit-btn" [disabled]="shippingForm.invalid || totalAmount <= 0 || isSubmitting">
              {{ isSubmitting ? 'Confirming...' : translation.t('shipping.confirm') }}
            </button>
          </form>

          <div *ngIf="success" class="success-state">
            <h3>{{ translation.t('shipping.successTitle') }}</h3>
            <p>{{ translation.t('shipping.successText') }}</p>
            <a class="btn whatsapp-followup" [href]="whatsappFollowUpUrl" target="_blank" rel="noopener">
              Follow up on WhatsApp
            </a>
            <button class="btn" (click)="goHome()">{{ translation.t('shipping.returnToStore') }}</button>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .shipping-shell { position: relative; min-height: 100vh; padding: 120px 0 40px; overflow: hidden; }
    .shipping-backdrop {
      position: absolute;
      inset: 0;
      z-index: -2;
      background:
        radial-gradient(circle at 20% 20%, rgba(112, 89, 192, 0.24), transparent 28%),
        radial-gradient(circle at 80% 18%, rgba(52, 129, 196, 0.18), transparent 26%),
        radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0.1), transparent 32%),
        linear-gradient(180deg, #05070f 0%, #0b1020 48%, #080b14 100%);
    }
    :host-context(body:not(.dark)) .shipping-backdrop {
      background:
        radial-gradient(circle at 20% 20%, rgba(189, 166, 206, 0.32), transparent 28%),
        radial-gradient(circle at 80% 18%, rgba(180, 211, 217, 0.38), transparent 26%),
        radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0.42), transparent 32%),
        linear-gradient(180deg, #fcfbff 0%, #edf3fa 45%, #f4ede5 100%);
    }
    .space-canvas { position: absolute; inset: 0; opacity: 0.9; }
    .moon-orbit {
      position: absolute;
      width: 920px;
      height: 920px;
      right: -310px;
      top: -120px;
      border-radius: 50%;
      animation: orbitDrift 20s ease-in-out infinite;
      pointer-events: none;
    }
    .moon {
      width: 190px;
      height: 190px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 28%, #fffef8 0%, #f2efdf 18%, #d0d2d7 50%, #949cab 74%, #677182 100%);
      box-shadow: 0 0 110px rgba(255, 255, 255, 0.32), inset -30px -30px 48px rgba(78, 88, 109, 0.42);
      position: absolute;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      overflow: hidden;
    }
    .moon::before,
    .moon::after {
      content: '';
      position: absolute;
      border-radius: 50%;
      background: rgba(116, 126, 145, 0.22);
    }
    .moon::before {
      width: 30px;
      height: 30px;
      top: 28px;
      left: 32px;
      box-shadow: 34px 22px 0 rgba(116, 126, 145, 0.16), 62px 68px 0 rgba(116, 126, 145, 0.12);
    }
    .moon::after {
      width: 18px;
      height: 18px;
      bottom: 34px;
      right: 34px;
      box-shadow: -56px -14px 0 rgba(116, 126, 145, 0.16);
    }
    :host-context(body:not(.dark)) .moon { box-shadow: 0 0 30px rgba(126, 133, 156, 0.18); }
    .shipping-layout { display: grid; grid-template-columns: 1fr 1.1fr; gap: 28px; align-items: stretch; }
    .shipping-visual, .shipping-card { border-radius: 28px; }
    .shipping-visual {
      min-height: 620px;
      padding: 40px;
      display: flex;
      align-items: flex-end;
      position: relative;
      overflow: hidden;
      background: linear-gradient(180deg, rgba(8, 12, 25, 0.1), rgba(8, 12, 25, 0.56));
    }
    :host-context(body:not(.dark)) .shipping-visual {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.62));
    }
    .visual-aura {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 30% 18%, rgba(160, 136, 236, 0.28), transparent 34%),
        radial-gradient(circle at 74% 35%, rgba(114, 170, 235, 0.24), transparent 28%),
        linear-gradient(180deg, rgba(5, 9, 18, 0.1), rgba(5, 9, 18, 0.55));
    }
    .visual-carousel {
      position: absolute;
      inset: 12px 12px 0;
      pointer-events: none;
      z-index: 1;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      perspective: 1000px;
    }
    .visual-model {
      position: absolute;
      left: 50%;
      top: 2%;
      width: auto;
      height: min(78%, 380px);
      max-width: 54%;
      max-height: 92%;
      object-fit: contain;
      opacity: 0;
      transform: translate3d(calc(-50% + 48px), 30px, 0) scale(0.88) rotate(-6deg);
      filter: drop-shadow(0 0 20px var(--primary-accent)) drop-shadow(0 28px 56px rgba(0, 0, 0, 0.55));
      transition: opacity 1s ease, transform 1.2s ease, filter 1.2s ease;
    }
    .visual-model.active {
      opacity: 1;
      transform: translate3d(-50%, 0, 0) scale(1) rotate(0deg);
      filter: drop-shadow(0 0 20px var(--primary-accent)) drop-shadow(0 34px 70px rgba(78, 54, 150, 0.38));
      animation: modelFloat 8s ease-in-out infinite;
    }
    .visual-model.previous {
      opacity: 0.32;
      transform: translate3d(calc(-50% - 8px), 14px, 0) scale(0.82) rotate(6deg);
      filter: drop-shadow(0 0 14px rgba(169, 140, 255, 0.45)) drop-shadow(0 18px 36px rgba(0, 0, 0, 0.35));
    }
    .visual-copy { position: relative; z-index: 2; max-width: 420px; color: #fff; }
    :host-context(body:not(.dark)) .visual-copy { color: #222; }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 0.8rem;
      margin-bottom: 12px;
      color: var(--secondary-accent);
      font-weight: 700;
    }
    .visual-copy h2 { font-size: clamp(2rem, 3vw, 3rem); line-height: 1.08; margin-bottom: 14px; }
    .visual-copy p { line-height: 1.6; opacity: 0.92; }
    .shipping-card { padding: 34px; }
    .shipping-card h2 { font-size: 2rem; margin-bottom: 24px; }
    .payment-note {
      display: grid;
      gap: 6px;
      margin: -8px 0 22px;
      padding: 16px 18px;
      border-radius: 18px;
      border: 1px solid rgba(87, 216, 163, .3);
      background: rgba(87, 216, 163, .1);
    }
    .payment-note strong { color: #57d8a3; }
    .payment-note span { opacity: .82; line-height: 1.5; }
    .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 8px; }
    .field.full { grid-column: 1 / -1; }
    .field label { font-weight: 600; }
    .field input,
    .field select,
    .field textarea {
      width: 100%;
      padding: 13px 14px;
      border-radius: 12px;
      border: 1px solid var(--glass-border);
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-color);
      outline: none;
    }
    .field textarea { resize: vertical; min-height: 110px; }
    .error-text { color: #ff8d99; font-size: 0.8rem; min-height: 1em; }
    .variant-section {
      display: grid;
      gap: 12px;
      margin-top: 18px;
      padding: 16px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.055);
      border: 1px solid var(--glass-border);
    }
    .variant-heading { display: grid; gap: 4px; }
    .variant-heading span { font-weight: 800; font-size: 1.05rem; }
    .variant-heading small { opacity: 0.72; }
    .variant-card {
      display: grid;
      grid-template-columns: 58px 1fr minmax(110px, 150px) minmax(110px, 150px);
      gap: 12px;
      align-items: center;
      padding: 12px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.055);
    }
    .variant-card img {
      width: 58px;
      height: 58px;
      object-fit: contain;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.06);
      padding: 6px;
    }
    .variant-copy { display: grid; gap: 4px; }
    .variant-copy span { opacity: .72; font-size: .92rem; }
    .variant-card label { display: grid; gap: 7px; font-weight: 700; }
    .variant-card select {
      width: 100%;
      padding: 11px 12px;
      border-radius: 12px;
      border: 1px solid var(--glass-border);
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-color);
      outline: none;
    }
    .order-summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 24px 0 18px;
      padding: 18px 20px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.06);
    }
    .order-summary strong { font-size: 1.4rem; color: var(--primary-accent); }
    .submit-btn { width: 100%; padding: 15px; font-size: 1.05rem; }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; transform: none; }
    .success-state { text-align: center; padding: 40px 0 10px; }
    .success-state h3 { font-size: 2rem; margin-bottom: 12px; color: #51cf66; }
    .success-state p { margin-bottom: 24px; }
    .whatsapp-followup {
      display: inline-flex;
      justify-content: center;
      margin: 0 10px 12px 0;
      text-decoration: none;
      background: linear-gradient(135deg, #25d366, #57d8a3);
    }
    @keyframes orbitDrift {
      0% { transform: rotate(0deg) translate3d(0, 0, 0) scale(1); }
      20% { transform: rotate(68deg) translate3d(40px, -18px, 0) scale(1.05); }
      45% { transform: rotate(152deg) translate3d(-34px, 36px, 0) scale(0.98); }
      70% { transform: rotate(255deg) translate3d(54px, 20px, 0) scale(1.04); }
      100% { transform: rotate(360deg) translate3d(0, 0, 0) scale(1); }
    }
    @keyframes modelFloat {
      0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
      25% { transform: translate3d(-8px, -12px, 0) scale(1.015) rotate(-1.5deg); }
      50% { transform: translate3d(10px, -4px, 0) scale(1) rotate(1deg); }
      75% { transform: translate3d(-6px, 10px, 0) scale(0.99) rotate(-1deg); }
      100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
    }
    @media (max-width: 900px) {
      .shipping-layout { grid-template-columns: 1fr; }
      .variant-card { grid-template-columns: 58px 1fr; }
      .variant-card label { grid-column: span 1; }
      .shipping-visual { min-height: 280px; }
      .moon-orbit { width: 640px; height: 640px; right: -240px; top: -120px; }
      .moon { width: 134px; height: 134px; }
      .visual-model { top: 2%; height: min(88%, 320px); max-width: 58%; }
    }
    @media (max-width: 640px) {
      .shipping-shell { padding-top: 96px; }
      .form-grid { grid-template-columns: 1fr; }
      .shipping-card { padding: 20px; border-radius: 22px; }
      .shipping-card h2 { font-size: 1.65rem; margin-bottom: 18px; }
      .payment-note { margin: -4px 0 18px; padding: 14px; }
      .shipping-visual { min-height: 300px; padding: 24px; border-radius: 22px; }
      .visual-carousel { inset: 10px; }
      .visual-model { top: 3%; height: min(86%, 260px); max-width: 68%; }
      .visual-model.previous { opacity: 0.18; }
      .variant-section { padding: 12px; }
      .variant-card { grid-template-columns: 52px 1fr; padding: 10px; }
      .variant-card img { width: 52px; height: 52px; }
      .variant-card label { grid-column: 1 / -1; }
      .variant-card select, .field input, .field textarea { min-height: 46px; font-size: 16px; }
      .order-summary { position: sticky; bottom: 76px; z-index: 4; margin: 20px 0 12px; padding: 14px 16px; backdrop-filter: blur(14px); }
      .submit-btn { position: sticky; bottom: 12px; z-index: 5; min-height: 52px; }
    }
    @media (max-width: 430px) {
      .shipping-layout { gap: 18px; }
      .shipping-visual { min-height: 260px; }
      .visual-copy h2 { font-size: 1.75rem; }
      .visual-copy p { font-size: .95rem; }
      .moon-orbit { opacity: .75; }
    }
  `]
})
export class ShippingComponent implements AfterViewInit, OnDestroy {
  @ViewChild('shippingStars', { static: true }) shippingStars!: ElementRef;

  carouselImages = [
    'assets/images/male_pose_1.png',
    'assets/images/male_pose_2.png',
    'assets/images/male_pose_3.png',
    'assets/images/female_pose_1.png',
    'assets/images/female_pose_2.png',
    'assets/images/female_pose_3.png'
  ];

  activeVisualIndex = 0;
  get previousVisualIndex(): number {
    return (this.activeVisualIndex - 1 + this.carouselImages.length) % this.carouselImages.length;
  }
  form = {
    name: '',
    email: '',
    phone: '',
    city: '',
    area: '',
    address: '',
    apartment: '',
    postalCode: ''
  };
  success = false;
  cartItems: CartItem[] = [];
  isSubmitting = false;
  submittedOrderId?: number;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private particles!: THREE.Points;
  private animationFrameId?: number;
  private visualIntervalId?: ReturnType<typeof setInterval>;
  private resizeHandler = () => this.onWindowResize();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private orderService: OrderService,
    private toastService: ToastService,
    private router: Router,
    public translation: TranslationService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.getCart().subscribe({
      next: data => {
        this.cartItems = data.map(item => ({
          ...item,
          selectedSize: item.selectedSize || item.product?.sizes?.[0],
          selectedColor: item.selectedColor || item.product?.colors?.[0]
        }));
      },
      error: () => this.cartItems = []
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initStars();
      this.startVisualCarousel();
    }
  }

  get totalAmount(): number {
    return this.cartItems.reduce((sum, item) => sum + ((item.unitPrice || item.product?.price || 0) * item.quantity), 0);
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.toastService.show(this.translation.t('shipping.errors.complete'), 'error');
      return;
    }

    if (this.totalAmount <= 0) {
      this.toastService.show(this.translation.t('shipping.errors.emptyCart'), 'error');
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    const fullAddress = [
      this.form.address,
      `${this.form.area}, ${this.form.city}`,
      `Apt/Building: ${this.form.apartment}`,
      `Postal Code: ${this.form.postalCode}`
    ].join(' | ');

    this.isSubmitting = true;

    this.orderService.createOrder({
      customerName: this.form.name,
      email: this.form.email,
      phoneNumber: this.form.phone,
      address: fullAddress,
      paymentMethod: 'CashOnDelivery',
      storeId: 0,
      items: this.cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      }))
    }).subscribe({
      next: response => {
        this.submittedOrderId = this.extractOrderId(response);
        this.cartService.clearCart().subscribe({
          next: () => {
            this.success = true;
            this.cartItems = [];
            this.isSubmitting = false;
          },
          error: () => {
            this.success = true;
            this.cartItems = [];
            this.isSubmitting = false;
          }
        });
      },
      error: error => {
        this.isSubmitting = false;
        this.toastService.show(this.getOrderError(error), 'error');
      }
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  getImgUrl(url: string | undefined): string {
    return assetUrl(url);
  }

  get whatsappFollowUpUrl(): string {
    const orderRef = this.submittedOrderId ? `Order #${this.submittedOrderId}` : 'my Moon Store order';
    const message = `Hello Moon Store, I want to follow up on ${orderRef}. Name: ${this.form.name}. Phone: ${this.form.phone}.`;
    return `https://wa.me/201017827060?text=${encodeURIComponent(message)}`;
  }

  private extractOrderId(response: unknown): number | undefined {
    if (Array.isArray(response)) {
      return response[0]?.id;
    }

    if (typeof response === 'object' && response && 'id' in response) {
      const id = (response as { id?: unknown }).id;
      return typeof id === 'number' ? id : undefined;
    }

    return undefined;
  }

  private getOrderError(error: unknown): string {
    if (typeof error === 'object' && error && 'error' in error) {
      const body = (error as { error?: unknown }).error;
      if (typeof body === 'string' && body.trim()) {
        return body;
      }

      if (typeof body === 'object' && body && 'message' in body) {
        const message = (body as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim()) {
          return message;
        }
      }
    }

    return this.translation.t('shipping.errors.createFailed');
  }

  private startVisualCarousel() {
    this.visualIntervalId = setInterval(() => {
      this.activeVisualIndex = (this.activeVisualIndex + 1) % this.carouselImages.length;
    }, 2800);
  }

  private initStars() {
    const container = this.shippingStars.nativeElement as HTMLElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starTexture = this.createStarTexture();
    const material = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x9b8ec7,
      map: starTexture,
      alphaMap: starTexture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(particlesGeometry, material);
    this.scene.add(this.particles);

    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      this.particles.rotation.y += 0.001;
      this.particles.rotation.x += 0.0005;
      const isDark = document.body.classList.contains('dark');
      (this.particles.material as THREE.PointsMaterial).color.setHex(isDark ? 0x9b8ec7 : 0x222222);
      this.renderer.render(this.scene, this.camera);
    };

    animate();
    window.addEventListener('resize', this.resizeHandler);
  }

  private createStarTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');

    if (context) {
      const gradient = context.createRadialGradient(32, 32, 2, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.35, 'rgba(210, 198, 255, 0.95)');
      gradient.addColorStop(0.7, 'rgba(155, 142, 199, 0.4)');
      gradient.addColorStop(1, 'rgba(155, 142, 199, 0)');
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(32, 32, 32, 0, Math.PI * 2);
      context.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  private onWindowResize() {
    const container = this.shippingStars?.nativeElement as HTMLElement | undefined;
    if (!container || !this.camera || !this.renderer) {
      return;
    }

    this.camera.aspect = container.clientWidth / Math.max(container.clientHeight, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }

      if (this.visualIntervalId) {
        clearInterval(this.visualIntervalId);
      }

      if (this.renderer) {
        this.renderer.dispose();
      }

      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}
