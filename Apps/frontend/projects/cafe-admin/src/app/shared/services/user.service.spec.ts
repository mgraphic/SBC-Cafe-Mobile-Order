import { TestBed } from '@angular/core/testing';

import { UsersService } from './users.service';

describe('UserTrackerLogService', () => {
  let service: UsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
