import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersTestComponent } from './orders-test.component';

describe('OrdersTestComponent', () => {
  let component: OrdersTestComponent;
  let fixture: ComponentFixture<OrdersTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
