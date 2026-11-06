import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { StoreState } from 'sbc-cafe-shared-module';
import { environment } from 'shared-lib';

@Service()
export class StoreService {
  private readonly http = inject(HttpClient);
  private readonly apiStoreUrl = environment.cafeStoreServiceUrl;
  private readonly apiAdminUrl = environment.cafeAdminServiceUrl;

  public isStoreOpen(): Observable<boolean> {
    return this.http
      .get<{ isStoreOpen: boolean }>(`${this.apiStoreUrl}/is-store-open`)
      .pipe(map((response) => response.isStoreOpen));
  }

  public openStore(duration: number): Observable<void> {
    return this.http.put<void>(`${this.apiAdminUrl}/openStore`, { duration });
  }

  public closeStore(): Observable<void> {
    return this.http.put<void>(`${this.apiAdminUrl}/closeStore`, {});
  }

  public getStoreStatus(): Observable<StoreState> {
    return this.http.get<StoreState>(`${this.apiStoreUrl}/store-status`);
  }
}
