import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastTestComponent } from './toast-test.component';

describe('ToastTestComponent', () => {
  let component: ToastTestComponent;
  let fixture: ComponentFixture<ToastTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
