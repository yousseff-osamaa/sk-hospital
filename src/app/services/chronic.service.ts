import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChronicService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Patient submits a request
  submit(form: FormData) {
    return this.http.post(`${this.api}/chronic/submit/`, form);
  }

  // Get all requests (admin)
  getAll() {
    return this.http.get<any[]>(`${this.api}/chronic/`);
  }

  // Update status (admin)
  updateStatus(id: number, status: 'Approved' | 'Rejected' | 'Pending') {
    return this.http.patch(`${this.api}/chronic/${id}/status/`, { status });
  }

  // Delete request (admin)
  delete(id: number) {
    return this.http.delete(`${this.api}/chronic/${id}/delete/`);
  }
}