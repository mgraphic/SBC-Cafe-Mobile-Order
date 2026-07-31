import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../../../shared-lib/src/lib/services/order.service';
import { CartService } from '../../shared/cart.service';
import { SharedModule } from '../../../../../shared-lib/src/public-api';
import { StripeOrderDetails } from 'sbc-cafe-shared-module';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';

@Component({
  selector: 'app-order-confirmation',
  imports: [SharedModule, RouterModule],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss',
})
export class OrderConfirmationComponent implements OnInit {
  protected readonly orderDetails = signal<Partial<StripeOrderDetails> | null>(null);

  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly activatedRoute = inject(ActivatedRoute);


  public ngOnInit(): void {
    this.cartService.clearCart();

    this.orderService
      .getOrderDetails(
        this.activatedRoute.snapshot.queryParamMap.get('csid') ?? '',
      )
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.orderDetails.set(response);
        },

        error: (error) => {
          console.error('Error fetching order details:', error);
        },
      });
  }
}
