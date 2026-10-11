import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  NewOrderAlertEventPayload,
  newOrderAlertRoom,
  RealtimeEvent,
} from 'sbc-cafe-shared-module';
import { Subject } from 'rxjs';
import { RealtimeService } from '../../../../../shared-lib/src/lib/services/realtime.service';

@Component({
  imports: [DatePipe],
  templateUrl: './orders-test.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './orders-test.component.scss',
})
export class OrdersTestComponent implements OnInit, OnDestroy {
  private readonly realtimeService = inject(RealtimeService);
  private readonly destroySubject = new Subject<void>();
  protected readonly events = signal<
    RealtimeEvent<NewOrderAlertEventPayload>[]
  >([]);

  ngOnInit(): void {
    this.realtimeService.onReady(() => {
      this.realtimeService
        .registerEventListener<NewOrderAlertEventPayload>(
          newOrderAlertRoom(),
          (event): void => {
            this.events.update((events) => [...events, event]);
          },
        )
        .takeUntilObservable(this.destroySubject);
    });
  }

  ngOnDestroy(): void {
    console.log(
      'OrdersTestComponent is being destroyed, cleaning up listeners',
    );
    this.destroySubject.next();
    this.destroySubject.complete();
  }
}
