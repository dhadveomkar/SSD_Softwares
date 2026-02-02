import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Review } from '../models/review';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private baseUrl = 'http://localhost:8080/api/reviews';

  constructor(private http: HttpClient) {}

  getReviews(phoneId: number) {
  return this.http.get<Review[]>(`${this.baseUrl}/${phoneId}`);
}

  addReview(review: Review) {
    return this.http.post(this.baseUrl, review);
  }

  updateReview(id: number, review: Review) {
    return this.http.put(`${this.baseUrl}/${id}`, review);
  }

  deleteReview(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getRating(phoneId: number) {
    return this.http.get<any>(`${this.baseUrl}/rating/${phoneId}`);
  }
}
