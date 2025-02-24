import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { demoItems } from '../../shared/demo-items';
import { ProductItem } from '../../shared/product.model';
import { SharedModule } from '../../shared/shared.module';
import { MenuTileComponent } from './menu-tile.component';
import { ProductService } from '../../shared/product.service';
import { take } from 'rxjs';

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
