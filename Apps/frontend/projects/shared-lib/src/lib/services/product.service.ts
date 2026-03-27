import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import {
  StripeProductPrice,
  StripeProductPriceList,
} from 'sbc-cafe-shared-module';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  protected readonly http = inject(HttpClient);
  protected readonly apiUrl = environment.cafeStoreServiceUrl;

  getAllItems(params?: {
    limit?: number;
    startingAfter?: string;
  }): Observable<StripeProductPriceList> {
    const queryParams: any = {};

    if (params?.limit) {
      queryParams.limit = params.limit;
    }

    if (params?.startingAfter) {
      queryParams.starting_after = params.startingAfter;
    }

    return this.http.get<StripeProductPriceList>(`${this.apiUrl}/items`, {
      params: queryParams,
    });
  }

  getItemBy(slugOrId: string): Observable<StripeProductPrice> {
    return this.http.get<StripeProductPrice>(`${this.apiUrl}/item/${slugOrId}`);
  }
}
