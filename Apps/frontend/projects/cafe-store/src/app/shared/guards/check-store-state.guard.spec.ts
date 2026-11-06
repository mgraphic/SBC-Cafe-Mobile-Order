import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { checkStoreStateGuard } from './check-store-state.guard';

describe('checkStoreStateGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      checkStoreStateGuard(...guardParameters),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
