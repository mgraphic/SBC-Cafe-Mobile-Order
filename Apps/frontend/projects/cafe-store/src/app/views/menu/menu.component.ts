import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { demoItems } from '../../shared/demo-items';
import { ProductItem } from '../../shared/product.model';
import { SharedModule } from '../../shared/shared.module';
import { MenuTileComponent } from './menu-tile.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [SharedModule, MenuTileComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  items: ProductItem[] = demoItems;

  constructor(private router: Router) {}

  onSelect(item: ProductItem) {
    this.router.navigate(['/details', item.slug]);
  }
}
