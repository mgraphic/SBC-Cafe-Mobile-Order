import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { delay, Observable } from 'rxjs';
import {
  IUser,
  IPageable,
  UserTrackerLogsLookup,
  PaginatedPayload,
  ITracker,
  IPageableMetadata,
} from 'sbc-cafe-shared-module';
import { environment } from '../../../../../shared-lib/src/public-api';
import { UserResponse } from '../models/user.model';
import { HttpResponse } from '../models/http.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly baseUrl = environment.cafeAdminServiceUrl;
  private readonly http = inject(HttpClient);

  getUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(`${this.baseUrl}/getUsers`);
  }

  getUser(email: string): Observable<IUser> {
    return this.http.get<IUser>(
      `${this.baseUrl}/getUser/${encodeURIComponent(email)}`
    );
  }

  getUserById(id: string): Observable<IUser> {
    return this.http.get<IUser>(`${this.baseUrl}/getUser/${id}`);
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

  addUser(user: UserResponse): Observable<HttpResponse> {
    return this.http.post<HttpResponse>(`${this.baseUrl}/addUser`, user);
  }

  updateUser(
    id: string,
    user: Partial<IUser>
  ): Observable<HttpResponse<UserResponse>> {
    return this.http
      .put<HttpResponse<UserResponse>>(`${this.baseUrl}/updateUser/${id}`, user)
      .pipe(
        // Wait for 0.5 seconds before emitting the result
        delay(500)
      );
  }

  deleteUser(id: string): Observable<HttpResponse<UserResponse>> {
    return this.http.delete<HttpResponse<UserResponse>>(
      `${this.baseUrl}/deleteUser/${id}`
    );
  }
}
