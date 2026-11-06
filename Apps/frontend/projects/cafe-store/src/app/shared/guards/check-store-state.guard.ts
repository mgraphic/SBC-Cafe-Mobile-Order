import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { take, catchError, of } from 'rxjs';
import { StoreService } from '../../../../../shared-lib/src/public-api';

export const checkStoreStateGuard: CanActivateFn = async (
  route,
  state,
): Promise<boolean> => {
  const storeService = inject(StoreService);

  return new Promise<boolean>((resolve) => {
    storeService
      .isStoreOpen()
      .pipe(
        take(1),
        catchError(() => of(false)),
      )
      .subscribe((isOpen) => {
        resolve(isOpen);
      });
  });
};
