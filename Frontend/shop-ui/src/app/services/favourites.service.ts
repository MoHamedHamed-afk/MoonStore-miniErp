import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Product } from './product.service';
import { apiUrl } from '../core/api.config';

export interface Favorite {
  id: number;
  userId: number;
  productId: number;
  product?: Product;
}

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {
  private apiUrl = apiUrl('/api/favorites');
  private favoriteIds: Set<number> = new Set();
  private currentUsername: string | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      const nextUsername = user?.username ?? null;
      if (this.currentUsername !== nextUsername) {
        this.currentUsername = nextUsername;
        this.favoriteIds.clear();
        if (user) {
          this.refreshFavorites();
        }
      }
    });
  }

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`
      })
    };
  }

  private refreshFavorites() {
    if (this.authService.isAuthenticated()) {
      this.getFavorites().subscribe({
        next: favs => {
          this.favoriteIds = new Set(favs.map(f => f.productId));
        },
        error: () => {
          this.favoriteIds.clear();
        }
      });
    } else {
      this.favoriteIds.clear();
    }
  }

  getFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(this.apiUrl, this.getHeaders());
  }

  isFavorite(productId: number): boolean {
    return this.favoriteIds.has(productId);
  }

  toggleFavorite(productId: number): Observable<any> {
    if (this.isFavorite(productId)) {
      this.favoriteIds.delete(productId);
      return this.removeFavorite(productId);
    } else {
      this.favoriteIds.add(productId);
      return this.addFavorite(productId);
    }
  }

  addFavorite(productId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}`, {}, this.getHeaders());
  }

  removeFavorite(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}`, this.getHeaders());
  }
}
