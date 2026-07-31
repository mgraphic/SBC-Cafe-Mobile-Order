import { DestroyRef, inject, Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Stripe, StripeCheckoutSessionMetadata } from 'sbc-cafe-shared-module';
import { Subject, take } from 'rxjs';
// import { environment } from '../../../../shared-lib/src/public-api';
import { CartItem } from './cart.model';
import { OrderService } from '../../../../shared-lib/src/lib/services/order.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly cartItems = new Map<string, CartItem>();
  // private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  // private readonly apiUrl = environment.cafeStoreServiceUrl;
  private readonly orderService = inject(OrderService);

  cartUpdated$: Subject<void> = new Subject();

  constructor() {
    const savedCart = sessionStorage.getItem('cart');
    if (savedCart) {
      const items: CartItem[] = JSON.parse(savedCart);
      items.forEach((item) => this.cartItems.set(item.id, item));
    }

    this.cartUpdated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.saveCartToSession());
  }

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

  submitOrder(metadata: StripeCheckoutSessionMetadata): void {
    const items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      this.getItems().map((item: CartItem) => ({
        price: item.default_price?.id || (item.default_price as string),
        quantity: item.quantity,
      }));

    this.orderService
      .submitOrder({
        items,
        metadata,
      })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.url) window.location.href = response.url;
        },
        error: (error) => {
          console.error('Error submitting order', error);
        },
      });
  }

  private saveCartToSession(): void {
    const items = this.getItems();
    sessionStorage.setItem('cart', JSON.stringify(items));
  }
}
