import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '../../shared/navigation.service';
import { CartService } from '../../shared/cart.service';
import {
  ProductService,
  SharedModule,
} from '../../../../../shared-lib/src/public-api';
import { StripeProductPrice } from 'sbc-cafe-shared-module';
import { take } from 'rxjs';

@Component({
  selector: 'app-details',
  imports: [SharedModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  item?: StripeProductPrice;

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly navigationService = inject(NavigationService);
  private readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);

  ngOnInit(): void {
    const { slug, productId } = this.activatedRoute.snapshot.params;
    this.productService
      .getItemBy(slug || productId)
      .pipe(take(1))
      .subscribe((item) => {
        this.item = item;
      });
  }

  goBack() {
    this.navigationService.goBack('/menu');
  }

  addToCart(item: StripeProductPrice): void {
    this.cartService.addToCart({ ...item, quantity: 1 });
  }
}
