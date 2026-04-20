import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartItem } from '../../shared/cart.model';
import { CartService } from '../../shared/cart.service';
import { SharedModule } from '../../../../../shared-lib/src/public-api';

@Component({
  selector: 'app-cart',
  imports: [SharedModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  protected cartItems: CartItem[] = [];
  protected readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.cartItems = this.cartService.getItems();

    this.cartService.cartUpdated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((): void => {
        this.cartItems = this.cartService.getItems();
      });
  }

  removeFromCart(item: CartItem): void {
    this.cartService.removeFromCart(item);
  }

  onCheckout(): void {
    const orderId = Math.random().toString(36).substring(2, 15); // Replace with actual order ID
    this.cartService.submitOrder(orderId);
  }
}
