import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartComponent } from './cart.component';
import { CartService } from '../../shared/cart.service';
import { of, Subject } from 'rxjs';
import { CartItem } from '../../shared/cart.model';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartService: jest.Mocked<CartService>;

  beforeEach(async () => {
    const cartServiceMock = {
      getItems: jest.fn(),
      removeFromCart: jest.fn(),
      cartUpdated$: of(),
    };

    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [{ provide: CartService, useValue: cartServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService) as jest.Mocked<CartService>;

    cartService.getItems.mockReturnValue([]);
    cartService.cartUpdated$ = new Subject<void>();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize cart items on init', () => {
    const mockItems: CartItem[] = [
      {
        id: 1,
        name: 'Item 1',
        price: 10,
        quantity: 1,
        slug: 'item-1',
        image: 'image-url',
      },
    ];
    cartService.getItems.mockReturnValue(mockItems);

    component.ngOnInit();

    expect((component as any).cartItems).toEqual(mockItems);
  });

  it('should update cart items when cart is updated', () => {
    const mockItems: CartItem[] = [
      {
        id: 1,
        name: 'Item 1',
        price: 10,
        quantity: 1,
        slug: 'item-1',
        image: 'image-url',
      },
    ];
    cartService.cartUpdated$ = new Subject<void>();
    cartService.getItems.mockReturnValue(mockItems);

    component.ngOnInit();

    expect((component as any).cartItems).toEqual(mockItems);
  });

  it('should call removeFromCart on cartService when removeFromCart is called', () => {
    const mockItem: CartItem = {
      id: 1,
      name: 'Item 1',
      price: 10,
      quantity: 1,
      slug: 'item-1',
      image: 'image-url',
    };

    component.removeFromCart(mockItem);

    expect(cartService.removeFromCart).toHaveBeenCalledWith(mockItem);
  });
});
