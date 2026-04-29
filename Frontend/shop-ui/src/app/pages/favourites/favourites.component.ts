import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { FavouritesService, Favorite } from '../../services/favourites.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { assetUrl } from '../../core/api.config';

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container favourites-page" style="padding-top: 120px; min-height: 100vh;">
      <h1 class="favourites-title" style="font-size: 3rem; margin-bottom: 40px; text-align: center;">{{ translation.t('favourites.title') }}</h1>

      <div class="glass favourites-state" *ngIf="isLoading" style="padding: 22px; border-radius: 16px; text-align: center;">Loading favourites...</div>
      <div class="glass favourites-state" *ngIf="favoritesError" style="padding: 22px; border-radius: 16px; text-align: center; color: #ff8d99;">
        {{ favoritesError }}
        <button type="button" class="btn" style="margin-left: 12px; padding: 8px 16px;" (click)="loadFavorites()">Retry</button>
      </div>

      <div *ngIf="!isLoading && !favoritesError && favorites.length === 0" style="text-align: center; opacity: 0.7;">
        <p>{{ translation.t('favourites.empty') }}</p>
      </div>

      <div class="product-grid favourites-grid" *ngIf="!isLoading && !favoritesError" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
        <div class="product-card glass" *ngFor="let fav of favorites; trackBy: trackByFavoriteId" style="padding: 20px; border-radius: 24px;">
          <div class="image-wrapper" style="width: 100%; height: 250px; overflow: hidden; border-radius: 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
            <img [src]="getImgUrl(fav.product?.imageUrl)" [alt]="fav.product?.name || 'Favorite product'" loading="lazy" decoding="async" style="max-height: 100%; max-width: 100%; object-fit: contain;">
          </div>
          <div class="product-info" style="text-align: center;">
            <h3 style="font-size: 1.2rem; margin-bottom: 10px;">{{ fav.product?.name }}</h3>
            <div class="price" style="font-size: 1.5rem; font-weight: 800; color: var(--primary-accent); margin-bottom: 20px;">\${{ fav.product?.price }}</div>
            <div class="action-buttons favourite-actions" style="display: flex; gap: 10px; justify-content: center;">
              <button type="button" class="btn" style="padding: 10px;" (click)="addToCart(fav.product?.id!)">{{ translation.t('favourites.addToCart') }}</button>
              <button type="button" class="btn" style="padding: 10px; background: #ff4757;" (click)="removeFav(fav.product?.id!)">{{ translation.t('favourites.remove') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @media (max-width: 640px) {
      .favourites-page { padding-top: 96px !important; }
      .favourites-title { font-size: clamp(2rem, 11vw, 2.55rem) !important; margin-bottom: 24px !important; }
      .favourites-state { display: grid; gap: 12px; }
      .favourites-state .btn { margin-left: 0 !important; width: 100%; min-height: 44px; }
      .favourites-grid { grid-template-columns: 1fr !important; gap: 18px !important; }
      .product-card { padding: 16px !important; border-radius: 22px !important; }
      .image-wrapper { height: 210px !important; }
      .product-info h3 { overflow-wrap: anywhere; }
      .favourite-actions { display: grid !important; grid-template-columns: 1fr; }
      .favourite-actions .btn { min-height: 46px; }
    }
  `]
})
export class FavouritesComponent implements OnInit {
  favorites: Favorite[] = [];
  isLoading = false;
  favoritesError = '';

  constructor(
    private authService: AuthService,
    private favService: FavouritesService,
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

    this.loadFavorites();
  }

  loadFavorites() {
    this.isLoading = true;
    this.favoritesError = '';
    this.favService.getFavorites().subscribe({
      next: data => {
        this.favorites = data;
        this.isLoading = false;
      },
      error: () => {
        this.favoritesError = 'Could not load favourites. Please try again.';
        this.isLoading = false;
      }
    });
  }

  getImgUrl(url: string | undefined): string {
    if (!url) return 'assets/images/placeholder.png';
    if (url.startsWith('http') || url.startsWith('assets/')) return url;
    return assetUrl(url);
  }

  removeFav(productId: number) {
    this.favService.removeFavorite(productId).subscribe({
      next: () => this.loadFavorites(),
      error: () => this.toastService.show('Could not remove this favourite.', 'error')
    });
  }

  addToCart(productId: number) {
    this.cartService.addToCart(productId).subscribe({
      next: () => this.toastService.show(this.translation.t('favourites.added'), 'success'),
      error: error => this.toastService.show(
        this.cartService.getUserFacingError(error, this.translation.t('favourites.loginFirst')),
        'error'
      )
    });
  }

  trackByFavoriteId(_: number, favorite: Favorite): number {
    return favorite.id;
  }
}
