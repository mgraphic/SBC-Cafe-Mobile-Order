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
    fixture.componentRef.setInput('item', {} as ProductItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
