import { Injectable } from '@angular/core';
import { CartItem } from './cart.model';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly cartItems = new Map<number, CartItem>();

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
      return acc + item.quantity * item.price;
    }, 0);
  }
}
