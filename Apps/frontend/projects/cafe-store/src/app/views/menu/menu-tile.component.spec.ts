import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuTileComponent } from './menu-tile.component';
import { ProductItem } from '../../shared/product.model';

describe('MenuTileComponent', () => {
  let component: MenuTileComponent;
  let fixture: ComponentFixture<MenuTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuTileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuTileComponent);
    fixture.componentRef.setInput('item', {
      slug: 'latte',
      name: 'Latte',
      price: 3.5,
      id: 1,
      image: 'latte.jpg',
    } as ProductItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct product name', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h4').textContent).toContain('Latte');
  });

  it('should display the correct product price', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.pricing').textContent).toContain('3.5');
  });

  it('should display the correct product image', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('img').src).toContain('latte.jpg');
  });
});
