import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { apiUrl } from '../core/api.config';

export interface User {
  id: number;
  username: string;
  role: string;
  assignedStoreId?: number | null;
}

export interface ModeratorPayload {
  username: string;
  password?: string;
  email?: string;
  phoneNumber?: string;
  assignedStoreId: number;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = apiUrl('/api/auth');
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { 
    this.checkToken();
  }

  private checkToken() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        this.decodeAndSetUser(token);
      }
    }
  }

  private decodeAndSetUser(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const id = Number(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.nameid || payload.sub || 0);
      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || 'User';
      const username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.unique_name || payload.sub || 'User';
      const assignedStoreIdValue = payload.assignedStoreId;
      const assignedStoreId = assignedStoreIdValue ? Number(assignedStoreIdValue) : null;
      this.currentUserSubject.next({ id, username, role, assignedStoreId });
    } catch (e) {
      this.currentUserSubject.next(null);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        const token = res.token ?? res.Token;
        if (token) {
          localStorage.setItem('token', token);
          this.decodeAndSetUser(token);
        }
      })
    );
  }

  register(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, credentials);
  }

  getModerators(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/moderators`, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }

  createModerator(payload: ModeratorPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/moderators`, payload, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }

  updateModerator(id: number, payload: ModeratorPayload): Observable<any> {
    return this.http.put(`${this.apiUrl}/moderators/${id}`, payload, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }

  deactivateModerator(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/moderators/${id}`, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }

  getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
