import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { apiUrl } from '../core/api.config';

export interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  productName: string;
  productImageUrl?: string;
  selectedSize?: string;
  selectedColor?: string;
  unitPrice: number;
}

export interface Order {
  id?: number;
  userId?: number | null;
  customerName: string;
  email: string;
  address: string;
  storeId: number;
  storeName: string;
  totalAmount: number;
  orderDate?: string;
  status: string;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  customerName: string;
  email: string;
  address: string;
  storeId: number;
  items: Array<{
    productId: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = apiUrl('/api/orders');

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`
      })
    };
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, this.getHeaders());
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/mine`, this.getHeaders());
  }

  createOrder(order: CreateOrderPayload): Observable<Order | Order[]> {
    return this.http.post<Order | Order[]>(this.apiUrl, order, this.getHeaders());
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, `"${status}"`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.getToken()}`
      })
    });
  }

  cancelMyOrder(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/cancel`, {}, this.getHeaders());
  }

  requestReturn(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/return-request`, {}, this.getHeaders());
  }
}
