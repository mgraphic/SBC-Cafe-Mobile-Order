import {
  HttpClient,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../shared-lib/src/environment';

@Injectable()
export class ApiAuthInterceptorService implements HttpInterceptor {
  private static readonly FETCH_API_RETRIES = 3;
  private static readonly FETCH_API_RETRY_DELAY_MS = 1000;

  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.cafeStoreServiceUrl;

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
