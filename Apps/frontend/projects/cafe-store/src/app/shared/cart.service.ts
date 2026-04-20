import { inject, Injectable } from '@angular/core';
import { CartItem } from './cart.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '../../../../shared-lib/src/public-api';
import { environment } from 'shared-lib';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly cartItems = new Map<string, CartItem>();
  private readonly http = inject(HttpClient);
  private readonly sessionService = inject(SessionService);
  private readonly apiUrl = environment.cafeStoreServiceUrl;

  cartUpdated$: Subject<void> = new Subject();

  addToCart(item: CartItem, qty: number = 1): void {
    const quantity = this.cartItems.get(item.id)?.quantity || 0;
    this.cartItems.set(item.id, { ...item, quantity: quantity + qty });
    this.cartUpdated$.next();
  }

  removeFromCart(item: CartItem, qty: number = 1): void {
    const quantity = this.cartItems.get(item.id)?.quantity || 0;

    if (quantity > 1) {
      this.cartItems.set(item.id, { ...item, quantity: quantity - qty });
    } else {
      this.cartItems.delete(item.id);
    }

    this.cartUpdated$.next();
  }

  deleteFromCart(item: CartItem): void {
    this.cartItems.delete(item.id);
    this.cartUpdated$.next();
  }

  getItems(): CartItem[] {
    return Array.from(this.cartItems.values());
  }

  clearCart(): void {
    this.cartItems.clear();
    this.cartUpdated$.next();
  }

  getTotalQuantityCount(): number {
    return this.getItems().reduce((acc: number, item: CartItem) => {
      return acc + item.quantity;
    }, 0);
  }

  getItemCount(): number {
    return this.cartItems.size;
  }

  getTotalPrice(): number {
    return this.getItems().reduce((acc: number, item: CartItem) => {
      return (
        acc +
        item.quantity * Number(item.default_price.unit_amount_decimal || 0)
      );
    }, 0);
  }

  submitOrder(orderId: string): void {
    const sessionId = this.sessionService.getSessionId();

    this.http
      .post(`${this.apiUrl}/submit-order`, { orderId, sessionId })
      .subscribe({
        next: (response) => {
          console.log('Order submitted successfully', response);
          this.clearCart();
        },
        error: (error) => {
          console.error('Error submitting order', error);
        },
      });
  }
}
