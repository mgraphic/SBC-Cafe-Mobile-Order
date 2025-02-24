import { Injectable } from '@angular/core';
import { environment } from '../../environment';
import { ProductItem } from './product.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  protected readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMenuItems(): Observable<ProductItem[]> {
    return this.http.get<ProductItem[]>(`${this.apiUrl}/menu`);
  }
}
