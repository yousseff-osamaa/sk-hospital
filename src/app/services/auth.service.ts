import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Observable<any> {
    return this.http.post(`${this.base}/register/`, data);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.base}/login/`, { email, password });
  }

  saveSession(tokens: any, userData: any) {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  }

  clearSession() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
}