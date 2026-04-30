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
          <div class="gallery-main">
            <button type="button" class="gallery-arrow" *ngIf="galleryImages.length > 1" (click)="changeImage(-1)" aria-label="Previous image">‹</button>
            <img [src]="selectedImageUrl" [alt]="product.name" loading="eager" decoding="async" style="width: 100%; border-radius: 16px;">
            <button type="button" class="gallery-arrow" *ngIf="galleryImages.length > 1" (click)="changeImage(1)" aria-label="Next image">›</button>
          </div>
          <div class="gallery-thumbs" *ngIf="galleryImages.length > 1">
            <button
              type="button"
              *ngFor="let image of galleryImages; let index = index"
              [class.active]="selectedImageIndex === index"
              (click)="selectImage(index)"
              [attr.aria-label]="'View product image ' + (index + 1)">
              <img [src]="getImgUrl(image)" [alt]="product.name + ' thumbnail ' + (index + 1)" loading="lazy" decoding="async">
            </button>
          </div>
        </div>
        <div class="product-copy" style="flex: 1; min-width: 300px; display: flex; flex-direction: column; justify-content: center;">
          <h1 style="font-size: 3rem; margin-bottom: 20px;">{{ product.name }}</h1>
          <p class="product-description" style="font-size: 1.2rem; margin-bottom: 30px; opacity: 0.8;">{{ product.description }}</p>
          <div class="product-price" style="font-size: 2.5rem; font-weight: 800; color: var(--primary-accent); margin-bottom: 16px;">{{ product.price }} EGP</div>
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
    .gallery-main {
      position: relative;
      display: grid;
      place-items: center;
      border-radius: 20px;
      overflow: hidden;
      background: rgba(255, 255, 255, .055);
    }
    .gallery-main img {
      max-height: 620px;
      object-fit: contain;
    }
    .gallery-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
      width: 44px;
      height: 44px;
      border: 1px solid var(--glass-border);
      border-radius: 999px;
      color: var(--text-color);
      background: rgba(10, 12, 20, .62);
      backdrop-filter: blur(12px);
      cursor: pointer;
      font-size: 2rem;
      line-height: 1;
    }
    .gallery-arrow:first-child { left: 12px; }
    .gallery-arrow:last-child { right: 12px; }
    .gallery-thumbs {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 14px;
    }
    .gallery-thumbs button {
      width: 76px;
      height: 76px;
      padding: 4px;
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      background: rgba(255, 255, 255, .07);
      cursor: pointer;
      opacity: .72;
    }
    .gallery-thumbs button.active {
      border-color: var(--primary-accent);
      opacity: 1;
      box-shadow: 0 0 0 3px rgba(155, 142, 199, .18);
    }
    .gallery-thumbs img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 12px;
    }
    @media (max-width: 720px) {
      .product-details-page { padding-top: 96px !important; }
      .product-details-card { padding: 18px !important; gap: 22px !important; border-radius: 22px !important; }
      .product-media, .product-copy { min-width: 0 !important; flex-basis: 100% !important; }
      .product-media img { max-height: 360px; object-fit: contain; background: rgba(255, 255, 255, .055); }
      .gallery-main img { max-height: 360px; }
      .gallery-thumbs { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 6px; }
      .gallery-thumbs button { flex: 0 0 68px; width: 68px; height: 68px; }
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
  selectedImageIndex = 0;

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
    this.productService.getProducts().subscribe({
      next: data => {
        this.product = data.find(product => product.id === id) || this.getFallbackProducts().find(product => product.id === id);
        this.selectedImageIndex = 0;
      },
      error: () => {
        this.product = this.getFallbackProducts().find(product => product.id === id);
        this.selectedImageIndex = 0;
      }
    });
  }

  get availableStores(): Store[] {
    const ids = this.product?.availableStoreIds ?? [];
    return this.stores.filter(store => ids.includes(store.id));
  }

  get galleryImages(): string[] {
    if (!this.product) {
      return [];
    }

    return [...(this.product.imageUrls || []), this.product.imageUrl]
      .filter((url): url is string => Boolean(url?.trim()))
      .map(url => url.trim())
      .filter((url, index, urls) => urls.findIndex(item => item.toLowerCase() === url.toLowerCase()) === index);
  }

  get selectedImageUrl(): string {
    return this.getImgUrl(this.galleryImages[this.selectedImageIndex] || this.product?.imageUrl);
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  changeImage(direction: number): void {
    const total = this.galleryImages.length;
    if (total <= 1) {
      return;
    }

    this.selectedImageIndex = (this.selectedImageIndex + direction + total) % total;
  }

  getImgUrl(url: string | undefined): string {
    if (!url) return 'assets/images/placeholder.png';
    if (url.startsWith('http') || url.startsWith('assets/')) {
      return url;
    }

    return assetUrl(url);
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

  private getFallbackProducts(): Product[] {
    return [
      {
        id: 1001,
        name: 'Rose Moon Hoodie Set',
        description: 'Soft rose hoodie and wide-leg pants with a quiet premium streetwear mood.',
        price: 1450,
        imageUrl: 'assets/images/moon-look-pink-set.png',
        imageUrls: ['assets/images/moon-look-pink-set.png'],
        category: 'Winter',
        stockQuantity: 18,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Rose', 'Black'],
        availableStoreIds: [1, 2]
      },
      {
        id: 1002,
        name: 'Charcoal Signature Set',
        description: 'A relaxed charcoal matching set designed for bold everyday comfort.',
        price: 1550,
        imageUrl: 'assets/images/moon-look-charcoal-set.png',
        imageUrls: ['assets/images/moon-look-charcoal-set.png'],
        category: 'Winter',
        stockQuantity: 16,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Charcoal', 'Black'],
        availableStoreIds: [1, 3]
      },
      {
        id: 1003,
        name: 'Burgundy Night Set',
        description: 'Deep burgundy lounge set with a statement premium finish.',
        price: 1650,
        imageUrl: 'assets/images/moon-look-burgundy-set.png',
        imageUrls: ['assets/images/moon-look-burgundy-set.png'],
        category: 'Winter',
        stockQuantity: 14,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Burgundy', 'Black'],
        availableStoreIds: [2, 3]
      },
      {
        id: 1004,
        name: 'Pink Denim Moon Hoodie',
        description: 'Bright pink hoodie paired with oversized denim energy for standout summer nights.',
        price: 1250,
        imageUrl: 'assets/images/moon-look-pink-hoodie.png',
        imageUrls: ['assets/images/moon-look-pink-hoodie.png'],
        category: 'Summer',
        stockQuantity: 20,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Pink', 'Blue'],
        availableStoreIds: [1, 2]
      },
      {
        id: 1005,
        name: 'Cream Breeze Set',
        description: 'Light cream two-piece set made for clean, effortless warm-weather styling.',
        price: 1350,
        imageUrl: 'assets/images/moon-look-cream-set.png',
        imageUrls: ['assets/images/moon-look-cream-set.png'],
        category: 'Summer',
        stockQuantity: 17,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Cream', 'White'],
        availableStoreIds: [1, 3]
      },
      {
        id: 1006,
        name: 'Layered Lounge Moon Set',
        description: 'Layered neutral lounge fit with soft movement and a polished Moon Store look.',
        price: 1500,
        imageUrl: 'assets/images/moon-look-layered-lounge.png',
        imageUrls: ['assets/images/moon-look-layered-lounge.png'],
        category: 'Summer',
        stockQuantity: 15,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Beige', 'Light Blue'],
        availableStoreIds: [2, 3]
      }
    ];
  }
}
