import { Component, input, output } from '@angular/core';
import { ProductItem } from '../../shared/product.model';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-menu-tile',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './menu-tile.component.html',
  styleUrl: './menu-tile.component.scss',
})
export class MenuTileComponent {
  readonly item = input.required<ProductItem>();
  readonly onSelect = output<ProductItem>();
}
