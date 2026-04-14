import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = environment.apiUrl;

  // ✅ Reads localStorage on startup so navbar knows immediately
  private loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
  }): Observable<any> {
    return this.http.post(`${this.base}/register/`, data);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.base}/login/`, { email, password });
  }

  // ✅ Call this right after successful login API response
  saveSession(tokens: any, userData: any) {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.loggedInSubject.next(true); // 🔔 notifies navbar instantly
  }

  // ✅ Call this on logout
  clearSession() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    this.loggedInSubject.next(false); // 🔔 notifies navbar instantly
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getCurrentUser(): any {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }
}