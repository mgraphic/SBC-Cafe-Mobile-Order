import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { CartService } from '../../cart.service';
import { ActivatedRoute } from '@angular/router';

const mockCartService = {
  getTotalQuantityCount: jest.fn().mockReturnValue(0),
  cartUpdated$: {
    pipe: jest.fn().mockReturnValue({
      subscribe: jest.fn(),
    }),
  },
};

const mockActivatedRoute = {
  snapshot: {
    params: {
      id: '123',
    },
  },
};

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: CartService, useValue: mockCartService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
