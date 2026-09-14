import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  CafeOrderDetails,
  IPageable,
  Order,
  PaginatedPayload,
  Stripe,
  StripeCheckoutSessionMetadata,
  StripeOrderDetails,
} from 'sbc-cafe-shared-module';
import { runtimeEnvironment } from '../../runtime-environment.generated';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly storeApiUrl = environment.cafeStoreServiceUrl;
  private readonly adminApiUrl = environment.cafeAdminServiceUrl;

  public submitOrder(orderData: {
    items?: Stripe.Checkout.SessionCreateParams.LineItem[];
    metadata?: StripeCheckoutSessionMetadata;
    cancelUrl?: string;
    successUrl?: string;
  }): Observable<{ ok: boolean; url?: string }> {
    return this.http.post<{ ok: boolean; url?: string }>(
      `${this.storeApiUrl}/submit-order`,
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

  public getCheckoutSession(
    checkoutSessionId: string,
  ): Observable<StripeOrderDetails> {
    return this.http
      .get<{
        ok: boolean;
        orderDetails?: StripeOrderDetails;
      }>(`${this.storeApiUrl}/checkout-session/${checkoutSessionId}`)
      .pipe(
        map((response) => {
          if (response.ok && response.orderDetails) {
            return response.orderDetails;
          } else {
            throw new Error('Order details not found');
          }
        }),
      );
  }

  public getOrder(checkoutSessionId: string): Observable<CafeOrderDetails> {
    return this.http
      .get<{
        ok: boolean;
        orderDetails?: CafeOrderDetails;
      }>(`${this.adminApiUrl}/order/${checkoutSessionId}`)
      .pipe(
        map((response) => {
          if (response.ok && response.orderDetails) {
            return response.orderDetails;
          } else {
            throw new Error('Order details not found');
          }
        }),
      );
  }

  public getOpenOrders(
    pagable: IPageable,
  ): Observable<PaginatedPayload<Order>> {
    return this.http.post<PaginatedPayload<Order>>(
      `${this.adminApiUrl}/openOrders`,
      pagable,
    );
  }

  public getOpenOrderDetails(
    pagable: IPageable,
  ): Observable<PaginatedPayload<CafeOrderDetails>> {
    return this.http.post<PaginatedPayload<CafeOrderDetails>>(
      `${this.adminApiUrl}/openOrderDetails`,
      pagable,
    );
  }
}
