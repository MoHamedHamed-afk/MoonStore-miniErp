import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FavouritesService } from '../../services/favourites.service';
import { Product, ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { assetUrl } from '../../core/api.config';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container" style="padding-top: 120px; min-height: 100vh;" *ngIf="product">
      <div class="glass" style="display: flex; flex-wrap: wrap; padding: 40px; border-radius: 24px; gap: 40px;">
        <div style="flex: 1; min-width: 300px;">
          <img [src]="imageUrl" [alt]="product.name" style="width: 100%; border-radius: 16px;">
        </div>
        <div style="flex: 1; min-width: 300px; display: flex; flex-direction: column; justify-content: center;">
          <h1 style="font-size: 3rem; margin-bottom: 20px;">{{ product.name }}</h1>
          <p style="font-size: 1.2rem; margin-bottom: 30px; opacity: 0.8;">{{ product.description }}</p>
          <div style="font-size: 2.5rem; font-weight: 800; color: var(--primary-accent); margin-bottom: 16px;">\${{ product.price }}</div>
          <div style="margin-bottom: 40px; opacity: 0.78;">
            {{ (product.stockQuantity || 0) > 0
              ? translation.t('product.inStockCount', { count: product.stockQuantity || 0 })
              : translation.t('product.outOfStock') }}
          </div>

          <div style="display: flex; gap: 20px;">
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
  `
})
export class ProductDetailsComponent implements OnInit {
  product: Product | undefined;

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
    this.productService.getProducts().subscribe(data => {
      this.product = data.find(product => product.id === id);
    });
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

    this.cartService.addToCart(this.product.id).subscribe({
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
