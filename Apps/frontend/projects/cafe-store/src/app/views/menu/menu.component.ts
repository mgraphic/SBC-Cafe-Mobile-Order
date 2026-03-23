import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { MenuTileComponent } from './menu-tile.component';
import { take } from 'rxjs';
import {
  ProductService,
  SharedModule,
} from '../../../../../shared-lib/src/public-api';
import {
  StripeProductPrice,
  StripeProductPriceList,
} from 'sbc-cafe-shared-module';

@Component({
  selector: 'app-menu',
  imports: [SharedModule, MenuTileComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements OnInit, AfterViewInit, OnDestroy {
  items: StripeProductPrice[] = [];
  isLoading = false;
  hasMore = true;

  private readonly scrollSentinel = viewChild<ElementRef>('scrollSentinel');

  private observer!: IntersectionObserver;
  private cursor: string | undefined;
  private isSentinelVisible = false;

  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loadMore();
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        this.isSentinelVisible = entries[0].isIntersecting;
        if (this.isSentinelVisible && !this.isLoading && this.hasMore) {
          this.loadMore();
        }
      },
      { threshold: 0.1 },
    );
    this.observer.observe(this.scrollSentinel()?.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private loadMore(): void {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;
    this.productService
      .getAllItems({ startingAfter: this.cursor })
      .pipe(take(1))
      .subscribe((list: StripeProductPriceList): void => {
        this.items = [...this.items, ...list.data];
        this.hasMore = list.has_more;
        if (list.data.length > 0) {
          this.cursor = list.data[list.data.length - 1].id;
        }
        this.isLoading = false;
        if (this.isSentinelVisible && this.hasMore) {
          this.loadMore();
        }
      });
  }

  protected onSelect(item: StripeProductPrice): void {
    this.router.navigate(['/details', item.metadata['slug'] || item.id]);
  }
}
