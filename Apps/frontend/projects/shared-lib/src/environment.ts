import { InjectionToken } from '@angular/core';

export const environment: Readonly<{
  realtimeGatewayServiceUrl: string;
  cafeStoreServiceUrl: string;
  cafeAdminServiceUrl: string;
  authServiceUrl: string;
  paginatedDefaultPagesize: number;
  accessToken?: string;
}> = {
  realtimeGatewayServiceUrl: 'http://localhost:3200',
  cafeStoreServiceUrl: 'cafe-service/api/v1/store',
  cafeAdminServiceUrl: 'cafe-service/api/v1/admin',
  authServiceUrl: 'auth-service/api/v1',
  paginatedDefaultPagesize: 10,
  // accessToken: process.env['ACCESS_TOKEN'],
};

export type Environment = typeof environment;

export const ENVIROMENT_INJECTION_TOKEN = new InjectionToken<Environment>(
  'ENVIROMENT_INJECTION_TOKEN',
);
