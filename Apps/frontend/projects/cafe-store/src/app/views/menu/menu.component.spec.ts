import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuComponent } from './menu.component';
import { ProductItem } from '../../../../../shared-lib/src/public-api';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let productItems: ProductItem[];

  beforeEach(async () => {
    productItems = [
      {
        slug: 'latte',
        name: 'Latte',
        price: 3.5,
        id: 1,
        image: 'latte.jpg',
      },
    ];

    await TestBed.configureTestingModule({
      imports: [MenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    component.items = productItems;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct number of products', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.querySelectorAll('.row > div').length).toBe(1);
  });
});
