import { TestBed } from '@angular/core/testing';

import { ToastConfigService } from './toast-config.service';

describe('ToastConfigService', () => {
  let service: ToastConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
