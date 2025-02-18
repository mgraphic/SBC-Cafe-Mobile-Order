import { TestBed } from '@angular/core/testing';

import { CartService } from './cart.service';
import { CartItem } from './cart.model';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get items from cart', () => {
    const item1: CartItem = {
      id: 1,
      name: 'Coffee',
      price: 5,
      quantity: 2,
      image: 'image.jpg',
      slug: 'slug',
    };
    const item2: CartItem = {
      id: 2,
      name: 'Tea',
      price: 3,
      quantity: 3,
      image: 'image.jpg',
      slug: 'slug',
    };
    service.addToCart(item1);
    service.addToCart(item2);

    const items = service.getItems();

    expect(items.length).toBe(2);

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
        }),
      ])
    );

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 2,
        }),
      ])
    );
  });

  it('should add item to cart', () => {
    const item: CartItem = {
      id: 1,
      name: 'Coffee',
      price: 5,
      quantity: 1,
      image: 'image.jpg',
      slug: 'slug',
    };
    service.addToCart(item);

    const items = service.getItems();
    expect(items.length).toBe(1);
    expect(items[0]).toEqual({ ...item, quantity: 1 });
  });

  it('should increase quantity if item already exists in cart', () => {
    const item: CartItem = {
      id: 1,
      name: 'Coffee',
      price: 5,
      quantity: 1,
      image: 'image.jpg',
      slug: 'slug',
    };
    service.addToCart(item);
    service.addToCart(item, 2);

    const items = service.getItems();
    expect(items.length).toBe(1);
    expect(items[0]).toEqual({ ...item, quantity: 3 });
  });

  it('should emit cartUpdated$ when item is added to cart', (done) => {
    const item: CartItem = {
      id: 1,
      name: 'Coffee',
      price: 5,
      quantity: 1,
      image: 'image.jpg',
      slug: 'slug',
    };
    service.cartUpdated$.subscribe(() => {
      done();
    });

    service.addToCart(item);
  });

  it('should remove item from cart', () => {
    const item: CartItem = {
      id: 1,
      name: 'Coffee',
      price: 5,
      quantity: 1,
      image: 'image.jpg',
      slug: 'slug',
    };
    service.addToCart(item);
    service.removeFromCart(item);

    const items = service.getItems();
    expect(items.length).toBe(0);
  });

  it('should delete item from cart', () => {
    const item: CartItem = {
      id: 1,
      name: 'Coffee',
      price: 5,
      quantity: 1,
      image: 'image.jpg',
      slug: 'slug',
    };
    service.addToCart(item);
    service.deleteFromCart(item);

    const items = service.getItems();
    expect(items.length).toBe(0);
  });

  it('should get total price', () => {
    const item1 = {
      id: 1,
      name: 'Coffee',
      price: 5,
      image: 'image.jpg',
      slug: 'slug',
    } as CartItem;
    const item2 = {
      id: 2,
      name: 'Tea',
      price: 3,
      image: 'image.jpg',
      slug: 'slug',
    } as CartItem;

    service.addToCart(item1, 2);
    service.addToCart(item2, 3);

    const totalPrice = service.getTotalPrice();
    expect(totalPrice).toBe(19);
  });

  it('should get item count', () => {
    const item1 = {
      id: 1,
      name: 'Coffee',
      price: 5,
      image: 'image.jpg',
      slug: 'slug',
    } as CartItem;
    const item2 = {
      id: 2,
      name: 'Tea',
      price: 3,
      image: 'image.jpg',
      slug: 'slug',
    } as CartItem;

    service.addToCart(item1, 2);
    service.addToCart(item2, 3);

    const itemCount = service.getItemCount();
    expect(itemCount).toBe(2);
  });

  it('should get total quantity count', () => {
    const item1 = {
      id: 1,
      name: 'Coffee',
      price: 5,
      image: 'image.jpg',
      slug: 'slug',
    } as CartItem;
    const item2 = {
      id: 2,
      name: 'Tea',
      price: 3,
      image: 'image.jpg',
      slug: 'slug',
    } as CartItem;

    service.addToCart(item1, 2);
    service.addToCart(item2, 3);

    const totalQuantity = service.getTotalQuantityCount();
    expect(totalQuantity).toBe(5);
  });

  it('should clear cart', () => {
    const item: CartItem = {
      id: 1,
      name: 'Coffee',
      price: 5,
      quantity: 1,
      image: 'image.jpg',
      slug: 'slug',
    };

    service.addToCart(item);
    service.clearCart();

    const items = service.getItems();
    expect(items.length).toBe(0);
  });
});
