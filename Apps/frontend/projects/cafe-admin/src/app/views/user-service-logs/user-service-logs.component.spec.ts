import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserServiceLogsComponent } from './user-service-logs.component';

describe('UserLogsComponent', () => {
  let component: UserServiceLogsComponent;
  let fixture: ComponentFixture<UserServiceLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserServiceLogsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserServiceLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
