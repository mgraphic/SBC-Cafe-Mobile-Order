import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Stripe, StripeCheckoutSessionMetadata, StripeOrderDetails } from 'sbc-cafe-shared-module';
import { environment } from 'shared-lib';
import { runtimeEnvironment } from '../../runtime-environment.generated';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.cafeStoreServiceUrl;

  public submitOrder(orderData: {
    items?: Stripe.Checkout.SessionCreateParams.LineItem[];
    metadata?: StripeCheckoutSessionMetadata;
    cancelUrl?: string;
    successUrl?: string;
  }): Observable<{ ok: boolean; url?: string }> {
    return this.http.post<{ ok: boolean; url?: string }>(
      `${this.apiUrl}/submit-order`,
      {
        items: orderData.items,
        successUrl:
          orderData.successUrl ??
          `${runtimeEnvironment.storeUrl}/order-confirmation?csid={CHECKOUT_SESSION_ID}`,
        cancelUrl: orderData.cancelUrl ?? `${runtimeEnvironment.storeUrl}/cart`,
        metadata: orderData.metadata,
      },
    );
  }

  public getOrderDetails(checkoutSessionId: string): Observable<StripeOrderDetails> {
    return this.http.get<{
      ok: boolean;
      orderDetails?: StripeOrderDetails;
    }>(`${this.apiUrl}/order/${checkoutSessionId}`).pipe(
      map((response) => {
        if (response.ok && response.orderDetails) {
          return response.orderDetails;
        } else {
          throw new Error('Order details not found');
        }
      }),
    );
  }
}
  