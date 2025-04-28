import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIROMENT_INJECTION_TOKEN } from '../environment';
import { ProductItem } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  protected readonly environment = inject(ENVIROMENT_INJECTION_TOKEN);
  protected readonly http = inject(HttpClient);
  protected readonly apiUrl = this.environment.cafeStoreServiceUrl;

  getMenuItems(): Observable<ProductItem[]> {
    return this.http.get<ProductItem[]>(`${this.apiUrl}/menu`);
  }
}
