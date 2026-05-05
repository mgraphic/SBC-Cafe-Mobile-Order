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
}> = {
  realtimeGatewayServiceUrl: runtimeEnvironment.realtimeGatewayServiceUrl,
  cafeStoreServiceUrl: 'cafe-service/api/v1/store',
  cafeAdminServiceUrl: 'cafe-service/api/v1/admin',
  authServiceUrl: 'auth-service/api/v1',
  paginatedDefaultPagesize: PAGINATED_DEFAULT_PAGESIZE,
  publishedSharedApiKey: runtimeEnvironment.publishedSharedApiKey,
};

export type Environment = typeof environment;

export const ENVIROMENT_INJECTION_TOKEN = new InjectionToken<Environment>(
  'ENVIROMENT_INJECTION_TOKEN',
);
