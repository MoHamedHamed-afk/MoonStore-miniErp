import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../core/api.config';

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  imageUrl?: string;
  imageUrls?: string[];
  category?: string;
  supplier?: string;
  stockQuantity?: number;
  sizes?: string[];
  colors?: string[];
  availableStoreIds?: number[];
  createdAt?: string;
}

export interface Store {
  id: number;
  name: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = apiUrl('/api/products');

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getStores(): Observable<Store[]> {
    return this.http.get<Store[]>(apiUrl('/api/stores'));
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product, { headers: this.getAuthHeaders() });
  }

  updateProduct(id: number, product: Product): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, product, { headers: this.getAuthHeaders() });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
