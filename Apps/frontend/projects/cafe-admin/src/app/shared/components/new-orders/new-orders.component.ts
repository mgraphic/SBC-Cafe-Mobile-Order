import { BooleanInput } from '@angular/cdk/coercion';
import { DatePipe } from '@angular/common';
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
  OnInit,
  DestroyRef,
} from '@angular/core';
import {
  Order,
  CafeOrderDetails,
  IPageable,
  PaginatedPayload,
  NewOrderAlertEventPayload,
  newOrderAlertRoom,
} from 'sbc-cafe-shared-module';
import { OrderService } from '../../../../../../shared-lib/src/lib/services/order.service';
import {
  environment,
  FormatPhoneNumberPipe,
  PaginatedComponent,
} from 'shared-lib';
import { Observable } from 'rxjs';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RealtimeService } from '../../../../../../shared-lib/src/public-api';
import { CountTimerComponent } from '../count-timer/count-timer.component';

@Component({
  selector: 'app-new-orders',
  imports: [
    NgbTooltipModule,
    DatePipe,
    FormatPhoneNumberPipe,
    PaginatedComponent,
    CountTimerComponent,
  ],
  templateUrl: './new-orders.component.html',
  styleUrl: './new-orders.component.scss',
})
export class NewOrdersComponent implements OnInit {
  public readonly showItems = input<BooleanInput>(false);
  public readonly showTimer = input<BooleanInput>(false);

  protected readonly displayItems = computed(() => Boolean(this.showItems()));
  protected readonly displayTimer = computed(() => Boolean(this.showTimer()));
  protected readonly currentPage = model<number>(1);
  protected readonly orders = signal<Order[]>([]);
  protected readonly orderDetails = signal<CafeOrderDetails[]>([]);
  protected readonly pageable = signal<IPageable>({
    pageSize: environment.paginatedDefaultPagesize,
    pageNumber: 1,
  });

  private readonly orderService = inject(OrderService);
  private readonly realtimeService = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);

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

  ngOnInit(): void {
    // Wait for socket to be ready before registering listener
    const checkAndRegister = () => {
      if (this.realtimeService.isReady()) {
        this.realtimeService
          .registerEventListener<NewOrderAlertEventPayload>(
            newOrderAlertRoom(),
            (): void => {
              this.fetchOrders();
            },
          )
          .takeUntilDestroyRef(this.destroyRef);
      } else {
        // Retry after a short delay
        setTimeout(checkAndRegister, 100);
      }
    };

    checkAndRegister();
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
