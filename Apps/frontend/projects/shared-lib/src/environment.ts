import { InjectionToken } from '@angular/core';
import { PAGINATED_DEFAULT_PAGESIZE } from 'sbc-cafe-shared-module';

export const environment: Readonly<{
  realtimeGatewayServiceUrl: string;
  cafeStoreServiceUrl: string;
  cafeAdminServiceUrl: string;
  authServiceUrl: string;
  paginatedDefaultPagesize: number;
  publishedSharedApiKey?: string | null;
}> = {
  realtimeGatewayServiceUrl: 'http://localhost:3200',
  cafeStoreServiceUrl: 'cafe-service/api/v1/store',
  cafeAdminServiceUrl: 'cafe-service/api/v1/admin',
  authServiceUrl: 'auth-service/api/v1',
  paginatedDefaultPagesize: PAGINATED_DEFAULT_PAGESIZE,
  publishedSharedApiKey: null, // This will be injected at runtime
};

export type Environment = typeof environment;

export const ENVIROMENT_INJECTION_TOKEN = new InjectionToken<Environment>(
  'ENVIROMENT_INJECTION_TOKEN',
);
