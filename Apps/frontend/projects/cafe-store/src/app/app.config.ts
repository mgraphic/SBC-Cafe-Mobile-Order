import {
  ApplicationConfig,
  provideAppInitializer,
  provideZoneChangeDetection,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { NavigationService } from './shared/navigation.service';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { SessionService } from '../../../shared-lib/src/lib/services/session.service';
import { RealtimeService } from '../../../shared-lib/src/lib/services/realtime.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    provideAppInitializer(async () => inject(NavigationService)),
    SessionService,
    RealtimeService,
    provideAppInitializer(() => inject(RealtimeService).connect()),
  ],
};
