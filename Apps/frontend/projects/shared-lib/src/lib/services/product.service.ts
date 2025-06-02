import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import { ProductItem } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  protected readonly http = inject(HttpClient);
  protected readonly apiUrl = environment.cafeStoreServiceUrl;

  getMenuItems(): Observable<ProductItem[]> {
    return this.http.get<ProductItem[]>(`${this.apiUrl}/menu`);
  }
}
