import { JsonPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { demoItems } from '../../shared/demo-items';
import { NavigationService } from '../../shared/navigation.service';
import { ProductItem } from '../../shared/product.model';
import { SharedModule } from '../../shared/shared.module';
import { CartService } from '../../shared/cart.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [JsonPipe, SharedModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  item?: ProductItem;

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly navigationService = inject(NavigationService);
  private readonly cartService = inject(CartService);

  ngOnInit(): void {
    this.item = demoItems.find(
      (item: ProductItem): boolean =>
        item.slug == this.activatedRoute.snapshot.params['slug']
    );
  }

  goBack() {
    this.navigationService.goBack('/menu');
  }

  addToCart(item: ProductItem): void {
    this.cartService.addToCart({ ...item, quantity: 1 });
  }
}
