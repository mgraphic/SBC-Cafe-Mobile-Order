import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewOrdersComponent } from './new-orders.component';

describe('NewOrdersComponent', () => {
  let component: NewOrdersComponent;
  let fixture: ComponentFixture<NewOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewOrdersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewOrdersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
