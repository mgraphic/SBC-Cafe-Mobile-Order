import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartItem } from '../../shared/cart.model';
import { CartService } from '../../shared/cart.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  protected cartItems: CartItem[] = [];
  protected readonly cartService = inject(CartService);
  private destroyRef = inject(DestroyRef);

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
}
