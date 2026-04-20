import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RealtimeService } from '../../../../../shared-lib/src/lib/services/realtime.service';
import { Subject } from 'rxjs';
import {
  NewOrderAlertEventPayload,
  newOrderAlertRoom,
  RealtimeEvent,
} from 'sbc-cafe-shared-module';
import { ToastService } from '../../../../../shared-lib/src/public-api';
import { DatePipe } from '@angular/common';

@Component({
  imports: [DatePipe],
  templateUrl: './orders-test.component.html',
  styleUrl: './orders-test.component.scss',
})
export class OrdersTestComponent implements OnInit, OnDestroy {
  private readonly realtimeService = inject(RealtimeService);
  private readonly toastService = inject(ToastService);
  private readonly destroySubject = new Subject<void>();
  protected readonly events = signal<
    RealtimeEvent<NewOrderAlertEventPayload>[]
  >([]);

  ngOnInit(): void {
    // Wait for socket to be ready before registering listener
    const checkAndRegister = () => {
      if (this.realtimeService.isReady()) {
        this.realtimeService
          .registerEventListener<NewOrderAlertEventPayload>(
            newOrderAlertRoom(),
            (event): void => {
              this.events.update((events) => [...events, event]);
            },
          )
          .takeUntilObservable(this.destroySubject);
      } else {
        // Retry after a short delay
        setTimeout(checkAndRegister, 100);
      }
    };

    checkAndRegister();
  }

  ngOnDestroy(): void {
    console.log(
      'OrdersTestComponent is being destroyed, cleaning up listeners',
    );
    this.destroySubject.next();
    this.destroySubject.complete();
  }
}
