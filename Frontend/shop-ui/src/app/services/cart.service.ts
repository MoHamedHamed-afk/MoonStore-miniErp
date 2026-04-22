import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Product } from './product.service';
import { TranslationService } from './translation.service';
import { apiUrl } from '../core/api.config';

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product?: Product;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = apiUrl('/api/cart');

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private translation: TranslationService
  ) { }

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`
      })
    };
  }

  getCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl, this.getHeaders());
  }

  addToCart(productId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}`, {}, this.getHeaders());
  }

  updateQuantity(id: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, quantity, this.getHeaders());
  }

  removeFromCart(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear`, this.getHeaders());
  }

  getUserFacingError(error: unknown, loginFallback?: string): string {
    const fallback = loginFallback ?? this.translation.t('product.loginRequired');

    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }

    if (error.status === 401 || error.status === 403) {
      return fallback;
    }

    const backendMessage = typeof error.error === 'string'
      ? error.error
      : error.error?.message;

    switch (backendMessage) {
      case 'This product is out of stock.':
        return this.translation.t('cart.errors.outOfStock');
      case 'No more stock is available for this item.':
        return this.translation.t('cart.errors.noMoreStock');
      case 'Requested quantity exceeds available stock.':
        return this.translation.t('cart.errors.stockExceeded');
      default:
        return backendMessage || fallback;
    }
  }
}
