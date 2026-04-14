import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="text-align:center; padding: 5rem;">
      <div *ngIf="status === 'loading'">Verifying your email...</div>
      <div *ngIf="status === 'success'" style="color: #00a76f;">
        <h2>✅ Email Verified!</h2>
        <p>Your account is now active. You can <a href="/portal">login here</a>.</p>
      </div>
      <div *ngIf="status === 'error'" style="color: red;">
        <h2>❌ Verification Failed</h2>
        <p>The link is invalid or has expired.</p>
      </div>
    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const uid = this.route.snapshot.queryParams['uid'];
    const token = this.route.snapshot.queryParams['token'];

    if (!uid || !token) {
      this.status = 'error';
      return;
    }

    const q = new URLSearchParams({ uid, token });
    this.http.get(`${environment.apiUrl}/verify-email/?${q.toString()}`)
      .subscribe({
        next: () => this.status = 'success',
        error: () => this.status = 'error'
      });
  }
}