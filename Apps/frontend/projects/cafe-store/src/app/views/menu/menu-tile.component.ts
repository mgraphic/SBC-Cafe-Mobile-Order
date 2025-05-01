import { Component, input, output } from '@angular/core';
import {
  ProductItem,
  SharedModule,
} from '../../../../../shared-lib/src/public-api';

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
