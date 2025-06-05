import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  IUser,
  IPageable,
  UserTrackerLogsLookup,
  PaginatedPayload,
  ITracker,
  IPageableMetadata,
} from 'sbc-cafe-shared-module';
import { environment } from '../../../../../shared-lib/src/public-api';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly baseUrl = environment.cafeAdminServiceUrl;
  private readonly http = inject(HttpClient);

  getUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(`${this.baseUrl}/getUsers`);
  }

  getLogs(
    pagable: IPageable,
    lookup?: UserTrackerLogsLookup,
    lookupValue?: string
  ): Observable<PaginatedPayload<ITracker>> {
    return this.http.post<{ data: ITracker[]; metadata: IPageableMetadata }>(
      `${this.baseUrl}/getUserLogs`,
      { ...pagable, lookup, lookupValue }
    );
  }
}
