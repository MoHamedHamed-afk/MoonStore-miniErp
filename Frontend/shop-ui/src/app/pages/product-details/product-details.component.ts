import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FavouritesService } from '../../services/favourites.service';
import { Product, ProductService, Store } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { assetUrl } from '../../core/api.config';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container product-details-page" style="padding-top: 120px; min-height: 100vh;" *ngIf="product">
      <div class="glass product-details-card" style="display: flex; flex-wrap: wrap; padding: 40px; border-radius: 24px; gap: 40px;">
        <div class="product-media" style="flex: 1; min-width: 300px;">
          <img [src]="imageUrl" [alt]="product.name" loading="eager" decoding="async" style="width: 100%; border-radius: 16px;">
        </div>
        <div class="product-copy" style="flex: 1; min-width: 300px; display: flex; flex-direction: column; justify-content: center;">
          <h1 style="font-size: 3rem; margin-bottom: 20px;">{{ product.name }}</h1>
          <p class="product-description" style="font-size: 1.2rem; margin-bottom: 30px; opacity: 0.8;">{{ product.description }}</p>
          <div class="product-price" style="font-size: 2.5rem; font-weight: 800; color: var(--primary-accent); margin-bottom: 16px;">\${{ product.price }}</div>
          <div class="variant-info" style="display: grid; gap: 14px; margin-bottom: 22px;">
            <div class="variant-group" *ngIf="product.sizes?.length" style="display: grid; gap: 8px;">
              <strong>Available sizes</strong>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <span *ngFor="let size of product.sizes" style="font-size: .9rem; padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,.08); border: 1px solid var(--glass-border);">{{ size }}</span>
              </div>
            </div>
            <div class="variant-group" *ngIf="product.colors?.length" style="display: grid; gap: 8px;">
              <strong>Available colors</strong>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <span *ngFor="let color of product.colors" style="font-size: .9rem; padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,.08); border: 1px solid var(--glass-border);">{{ color }}</span>
              </div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <span *ngFor="let store of availableStores" style="font-size: .82rem; padding: 6px 10px; border-radius: 999px; background: rgba(255,255,255,.08);">{{ store.name }}</span>
            </div>
          </div>
          <div style="margin-bottom: 40px; opacity: 0.78;">
            {{ (product.stockQuantity || 0) > 0
              ? translation.t('product.inStockCount', { count: product.stockQuantity || 0 })
              : translation.t('product.outOfStock') }}
          </div>

          <div class="product-actions" style="display: flex; gap: 20px;">
            <button class="btn" style="flex: 1; padding: 15px; font-size: 1.2rem; display: flex; justify-content: center; align-items: center; gap: 10px;" (click)="addToCart()" [disabled]="(product.stockQuantity || 0) <= 0">
              <span>&#128722;</span> {{ translation.t('product.addToCart') }}
            </button>
            <button class="btn" style="padding: 15px 25px; font-size: 1.2rem; background: transparent; border: 1px solid var(--primary-accent);" (click)="addToFav()" title="Add to Favourites">
              &#9825;
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @media (max-width: 720px) {
      .product-details-page { padding-top: 96px !important; }
      .product-details-card { padding: 18px !important; gap: 22px !important; border-radius: 22px !important; }
      .product-media, .product-copy { min-width: 0 !important; flex-basis: 100% !important; }
      .product-media img { max-height: 360px; object-fit: contain; background: rgba(255, 255, 255, .055); }
      .product-copy h1 { font-size: clamp(2rem, 11vw, 2.65rem) !important; margin-bottom: 14px !important; overflow-wrap: anywhere; }
      .product-description { font-size: 1rem !important; margin-bottom: 18px !important; line-height: 1.65; }
      .product-price { font-size: 2rem !important; }
      .variant-info { gap: 12px !important; margin-bottom: 18px !important; }
      .variant-group span { min-height: 38px; display: inline-flex; align-items: center; }
      .product-actions { position: sticky; bottom: 12px; z-index: 4; display: grid !important; grid-template-columns: 1fr 56px; gap: 10px !important; padding: 10px; margin: 0 -10px -10px; border-radius: 18px; background: rgba(12, 13, 22, .72); backdrop-filter: blur(16px); }
      :host-context(body:not(.dark)) .product-actions { background: rgba(255, 255, 255, .78); }
      .product-actions .btn { min-height: 50px; padding: 12px !important; font-size: 1rem !important; }
    }
  `]
})
export class ProductDetailsComponent implements OnInit {
  product: Product | undefined;
  stores: Store[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private favService: FavouritesService,
    private toastService: ToastService,
    public translation: TranslationService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getStores().subscribe(stores => this.stores = stores);
    this.productService.getProducts().subscribe(data => {
      this.product = data.find(product => product.id === id);
    });
  }

  get availableStores(): Store[] {
    const ids = this.product?.availableStoreIds ?? [];
    return this.stores.filter(store => ids.includes(store.id));
  }

  get imageUrl(): string {
    if (!this.product?.imageUrl) return 'assets/images/placeholder.png';
    if (this.product.imageUrl.startsWith('http') || this.product.imageUrl.startsWith('assets/')) {
      return this.product.imageUrl;
    }

    return assetUrl(this.product.imageUrl);
  }

  addToCart() {
    if (!this.product?.id) {
      return;
    }

    this.cartService.addToCart(this.product.id, { quantity: 1 }).subscribe({
      next: () => this.toastService.show(this.translation.t('product.addedToCart'), 'success'),
      error: error => this.toastService.show(
        this.cartService.getUserFacingError(error, this.translation.t('product.loginCart')),
        'error'
      )
    });
  }

  addToFav() {
    if (!this.product?.id) {
      return;
    }

    this.favService.toggleFavorite(this.product.id).subscribe({
      next: () => this.toastService.show(this.translation.t('product.updatedFavourites'), 'success'),
      error: () => this.toastService.show(this.translation.t('product.loginFav'), 'error')
    });
  }
}
