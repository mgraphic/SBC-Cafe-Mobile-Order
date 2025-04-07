import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  BehaviorSubject,
  distinctUntilChanged,
  firstValueFrom,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { environment } from '../../../environment';
import { IAuthResponse } from '../models/auth.model';
import { IUser } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authServiceUrl = environment.authServiceUrl;
  private readonly http = inject(HttpClient);
  private readonly jwtHelper = inject(JwtHelperService);
  private readonly isLoggedInSubject = new BehaviorSubject<boolean>(
    this.hasToken()
  );
  private user: IUser | null = null;

  public readonly isLoggedIn$ = this.isLoggedInSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  public login(username: string, password: string): Observable<IAuthResponse> {
    return this.http
      .post<IAuthResponse>(`${this.authServiceUrl}/login`, {
        username,
        password,
      })
      .pipe(
        tap({
          next: (response: IAuthResponse) => {
            this.storeToken(response.accessToken);
            this.user = this.jwtHelper.decodeToken<IUser>(response.accessToken);
            this.isLoggedInSubject.next(true);
          },

          error: (error: HttpErrorResponse) => {
            console.error('Login error:', error);
            this.removeToken();
            this.user = null;
            this.isLoggedInSubject.next(false);
          },
        }),
        switchMap((response) => of(response))
      );
  }

  public logout(): void {
    this.removeToken();
    this.user = null;
    this.isLoggedInSubject.next(false);
    this.http.get(`${this.authServiceUrl}/logout`).pipe(take(1)).subscribe();
  }

  private refresh(): Observable<IAuthResponse> {
    return this.http.get<IAuthResponse>(`${this.authServiceUrl}/refresh`).pipe(
      tap({
        next: (response: IAuthResponse) => {
          this.removeToken();
          this.storeToken(response.accessToken);
        },

        error: (error: HttpErrorResponse) => {
          console.error('Refresh error:', error);
          this.removeToken();
          this.isLoggedInSubject.next(false);
        },
      })
    );
  }

  public getToken(): string | null {
    return sessionStorage.getItem('accessToken');
  }

  private storeToken(accessToken: string): void {
    if (!accessToken) {
      this.removeToken();
      return;
    }

    sessionStorage.setItem('accessToken', accessToken);
  }

  private removeToken(): void {
    this.user = null;
    sessionStorage.removeItem('accessToken');
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private isTokenExpired(token?: string): boolean {
    return this.jwtHelper.isTokenExpired(token || this.getToken());
  }

  public isAuthenticated(): Promise<boolean> {
    if (!this.hasToken()) {
      return Promise.resolve(false);
    }

    return new Promise(async (resolve) => {
      if (this.isTokenExpired()) {
        const refresh$ = this.refresh().pipe(take(1));
        await firstValueFrom(refresh$);
        resolve(this.hasToken() && !this.isTokenExpired());
      }

      resolve(this.hasToken() && !this.isTokenExpired());
    });
  }

  public getUser(): IUser | null {
    if (!this.user && this.hasToken()) {
      this.user = this.jwtHelper.decodeToken<IUser>(this.getToken() as string);
    }

    return this.user;
  }
}
