import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface OrderRequest {
  items: OrderItem[];
  shipping: number;
}

export interface OrderResponse {
  id: number;
  items: OrderItem[];
  total: number;
  shipping: number;
  status: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = HttpClient;
  private readonly ordersUrl = 'api/orders';

  constructor(private readonly http: HttpClient) {}

  createOrder(request: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.ordersUrl, request);
  }
}
