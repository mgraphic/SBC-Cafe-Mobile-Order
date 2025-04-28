import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuTileComponent } from './menu-tile.component';
import { take } from 'rxjs';
import {
  ProductItem,
  ProductService,
  SharedModule,
} from '../../../../../shared-lib/src/public-api';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [SharedModule, MenuTileComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements OnInit {
  items: ProductItem[] = [];

  constructor(private router: Router, private productService: ProductService) {}

  ngOnInit(): void {
    this.productService
      .getMenuItems()
      .pipe(take(1))
      .subscribe((items: ProductItem[]): void => {
        this.items = items;
      });
  }

  onSelect(item: ProductItem) {
    this.router.navigate(['/details', item.slug]);
  }
}
