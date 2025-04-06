import {
  ApplicationConfig,
  Provider,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';

import { AuthInterceptorService } from './shared/interceptors/auth-interceptor.service';
import { LoginInterceptorService } from './shared/interceptors/login-interceptor.service';
import { routes } from './app.routes';

const interceptorProviders: Provider[] = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: LoginInterceptorService,
    multi: true,
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptorService,
    multi: true,
  },
];

const jwtHelperProviders: Provider[] = [
  {
    provide: JwtHelperService,
    useClass: JwtHelperService,
  },
  {
    provide: JWT_OPTIONS,
    useValue: JWT_OPTIONS,
  },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    ...interceptorProviders,
    ...jwtHelperProviders,
  ],
};
