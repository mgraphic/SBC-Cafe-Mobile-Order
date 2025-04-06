import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  private readonly authService = inject(AuthService);

  public intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const authToken = this.authService.getToken();

    if (authToken) {
      const authRequest = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${authToken}`),
      });

      return next.handle(authRequest);
    }

    return next.handle(request);
  }
}
