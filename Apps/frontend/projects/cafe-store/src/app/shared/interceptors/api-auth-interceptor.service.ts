import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'shared-lib';

@Injectable()
export class ApiAuthInterceptorService implements HttpInterceptor {
  public intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const apiKey = environment.publishedSharedApiKey;

    if (apiKey) {
      request = request.clone({
        setHeaders: {
          'X-Public-Api-Key': apiKey,
        },
      });
    }

    return next.handle(request);
  }
}
