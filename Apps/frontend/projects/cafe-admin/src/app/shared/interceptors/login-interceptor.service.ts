import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoginInterceptorService implements HttpInterceptor {
  private readonly router = inject(Router);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      tap({
        error: (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401 || err.status === 403) {
              this.router.navigate(['login']);
            }
          }
        },
      })
    );
  }
}
