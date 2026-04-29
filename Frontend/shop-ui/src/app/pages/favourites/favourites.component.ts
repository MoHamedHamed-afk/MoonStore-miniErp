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
    <div class="container" style="padding-top: 120px; min-height: 100vh;">
      <h1 style="font-size: 3rem; margin-bottom: 40px; text-align: center;">{{ translation.t('favourites.title') }}</h1>

      <div *ngIf="favorites.length === 0" style="text-align: center; opacity: 0.7;">
        <p>{{ translation.t('favourites.empty') }}</p>
      </div>

      <div class="product-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
        <div class="product-card glass" *ngFor="let fav of favorites; trackBy: trackByFavoriteId" style="padding: 20px; border-radius: 24px;">
          <div class="image-wrapper" style="width: 100%; height: 250px; overflow: hidden; border-radius: 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
            <img [src]="getImgUrl(fav.product?.imageUrl)" [alt]="fav.product?.name || 'Favorite product'" loading="lazy" decoding="async" style="max-height: 100%; max-width: 100%; object-fit: contain;">
          </div>
          <div class="product-info" style="text-align: center;">
            <h3 style="font-size: 1.2rem; margin-bottom: 10px;">{{ fav.product?.name }}</h3>
            <div class="price" style="font-size: 1.5rem; font-weight: 800; color: var(--primary-accent); margin-bottom: 20px;">\${{ fav.product?.price }}</div>
            <div class="action-buttons" style="display: flex; gap: 10px; justify-content: center;">
              <button type="button" class="btn" style="padding: 10px;" (click)="addToCart(fav.product?.id!)">{{ translation.t('favourites.addToCart') }}</button>
              <button type="button" class="btn" style="padding: 10px; background: #ff4757;" (click)="removeFav(fav.product?.id!)">{{ translation.t('favourites.remove') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FavouritesComponent implements OnInit {
  favorites: Favorite[] = [];

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
    this.favService.getFavorites().subscribe(data => this.favorites = data);
  }

  getImgUrl(url: string | undefined): string {
    if (!url) return 'assets/images/placeholder.png';
    if (url.startsWith('http') || url.startsWith('assets/')) return url;
    return assetUrl(url);
  }

  removeFav(productId: number) {
    this.favService.removeFavorite(productId).subscribe(() => this.loadFavorites());
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
