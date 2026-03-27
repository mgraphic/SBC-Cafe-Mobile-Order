import { Component, input, output } from '@angular/core';
import { SharedModule } from '../../../../../shared-lib/src/public-api';
import { StripeProductPrice } from 'sbc-cafe-shared-module';

@Component({
  selector: 'app-menu-tile',
  imports: [SharedModule],
  templateUrl: './menu-tile.component.html',
  styleUrl: './menu-tile.component.scss',
})
export class MenuTileComponent {
  readonly item = input.required<StripeProductPrice>();
  readonly onSelect = output<StripeProductPrice>();
}
