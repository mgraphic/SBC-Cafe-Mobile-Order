import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsComponent } from './details.component';
import { ActivatedRoute } from '@angular/router';
import { ProductItem } from '../../../../../shared-lib/src/public-api';

const mockActivatedRoute = {
  snapshot: {
    params: {
      slug: 'latte',
    },
  },
};

describe('DetailsComponent', () => {
  let component: DetailsComponent;
  let fixture: ComponentFixture<DetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct item based on the slug from the route', () => {
    expect(component.item?.slug).toBe('latte');
  });

  it('should call navigationService.goBack when goBack is called', () => {
    const navigationServiceSpy = jest.spyOn(
      component['navigationService'],
      'goBack'
    );
    component.goBack();
    expect(navigationServiceSpy).toHaveBeenCalledWith('/menu');
  });

  it('should call cartService.addToCart when addToCart is called', () => {
    const cartServiceSpy = jest.spyOn(component['cartService'], 'addToCart');
    const mockItem: ProductItem = {
      slug: 'latte',
      name: 'Latte',
      price: 3.5,
      id: 0,
      image: '',
    };
    component.addToCart(mockItem);
    expect(cartServiceSpy).toHaveBeenCalledWith({ ...mockItem, quantity: 1 });
  });
});
