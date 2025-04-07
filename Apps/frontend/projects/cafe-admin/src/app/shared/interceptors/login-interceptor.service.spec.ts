import { TestBed } from '@angular/core/testing';

import { LoginInterceptorService } from './login-interceptor.service';

describe('LoginInterceptorService', () => {
  let service: LoginInterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
