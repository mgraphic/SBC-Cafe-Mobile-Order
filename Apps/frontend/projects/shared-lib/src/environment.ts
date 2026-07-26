import { InjectionToken } from '@angular/core';
import { PAGINATED_DEFAULT_PAGESIZE } from 'sbc-cafe-shared-module';
import { runtimeEnvironment } from './runtime-environment.generated';

export const environment: Readonly<{
  realtimeGatewayServiceUrl: string;
  cafeStoreServiceUrl: string;
  cafeAdminServiceUrl: string;
  authServiceUrl: string;
  paginatedDefaultPagesize: number;
  publishedSharedApiKey?: string | null;
  adminUrl: string;
  storeUrl: string;
}> = {
  realtimeGatewayServiceUrl: runtimeEnvironment.realtimeGatewayServiceUrl,
  cafeStoreServiceUrl: 'cafe-service/api/v1/store',
  cafeAdminServiceUrl: 'cafe-service/api/v1/admin',
  authServiceUrl: 'auth-service/api/v1',
  paginatedDefaultPagesize: PAGINATED_DEFAULT_PAGESIZE,
  publishedSharedApiKey: runtimeEnvironment.publishedSharedApiKey,
  adminUrl: runtimeEnvironment.adminUrl,
  storeUrl: runtimeEnvironment.storeUrl,
};

export type Environment = typeof environment;

export const ENVIRONMENT_INJECTION_TOKEN = new InjectionToken<Environment>(
  'ENVIRONMENT_INJECTION_TOKEN',
);
