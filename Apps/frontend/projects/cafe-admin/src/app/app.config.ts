import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  Provider,
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { routes } from './app.routes';
import { AuthInterceptorService } from './shared/interceptors/auth-interceptor.service';
import { LoginInterceptorService } from './shared/interceptors/login-interceptor.service';
import { SharedModule } from '../../../shared-lib/src/public-api';
import { RealtimeService } from '../../../shared-lib/src/lib/services/realtime.service';
import { SessionService } from '../../../shared-lib/src/lib/services/session.service';

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
    importProvidersFrom(SharedModule.forRoot()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    ...interceptorProviders,
    ...jwtHelperProviders,
    SessionService,
    RealtimeService,
    provideAppInitializer(() => inject(RealtimeService).connect()),
  ],
};
