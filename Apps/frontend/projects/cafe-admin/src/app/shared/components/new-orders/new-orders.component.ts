import { BooleanInput } from '@angular/cdk/coercion';
import { take } from 'rxjs/operators';
import {
  Component,
  computed,
  inject,
  input,
  signal,
  model,
  effect,
  untracked,
} from '@angular/core';
import {
  Order,
  CafeOrderDetails,
  IPageable,
  PaginatedPayload,
} from 'sbc-cafe-shared-module';
import { OrderService } from '../../../../../../shared-lib/src/lib/services/order.service';
import { environment, PaginatedComponent } from 'shared-lib';
import { Observable } from 'rxjs';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-new-orders',
  imports: [NgbTooltipModule, PaginatedComponent],
  templateUrl: './new-orders.component.html',
  styleUrl: './new-orders.component.scss',
})
export class NewOrdersComponent {
  public readonly showItems = input<BooleanInput>(false);

  protected readonly displayItems = computed(() => Boolean(this.showItems()));
  protected readonly currentPage = model<number>(1);
  protected readonly orders = signal<Order[]>([]);
  protected readonly orderDetails = signal<CafeOrderDetails[]>([]);
  protected readonly pageable = signal<IPageable>({
    pageSize: environment.paginatedDefaultPagesize,
    pageNumber: 1,
  });

  private readonly orderService = inject(OrderService);

  public constructor() {
    effect(() => {
      const page = this.currentPage();
      this.displayItems();

      if (page) {
        this.pageable.update((prev) => ({
          ...prev,
          pageNumber: page,
        }));

        untracked(() => this.fetchOrders());
      }
    });
  }

  private fetchOrders(): void {
    const observable$: Observable<PaginatedPayload<Order | CafeOrderDetails>> =
      this.displayItems()
        ? this.orderService.getOpenOrderDetails(this.pageable())
        : this.orderService.getOpenOrders(this.pageable());

    observable$.pipe(take(1)).subscribe({
      next: (response) => {
        if (this.displayItems()) {
          this.orderDetails.set(response.data as CafeOrderDetails[]);
        } else {
          this.orders.set(response.data as Order[]);
        }
        this.pageable.set(response.metadata);
      },
      error: (err) => {
        console.error('Failed to fetch orders', err);
      },
    });
  }
}
