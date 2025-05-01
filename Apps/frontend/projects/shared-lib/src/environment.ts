import { InjectionToken } from '@angular/core';

export const environment: Readonly<{
  cafeStoreServiceUrl: string;
  cafeAdminServiceUrl: string;
  authServiceUrl: string;
}> = {
  cafeStoreServiceUrl: 'cafe-service/api/v1/store',
  cafeAdminServiceUrl: 'cafe-service/api/v1/admin',
  authServiceUrl: 'auth-service/api/v1',
};

export type Environment = typeof environment;

export const ENVIROMENT_INJECTION_TOKEN = new InjectionToken<Environment>(
  'ENVIROMENT_INJECTION_TOKEN'
);
