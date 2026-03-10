import { TestBed } from '@angular/core/testing';

import { ToastControllerService } from './toast-controller.service';

describe('ToastControllerService', () => {
  let service: ToastControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
