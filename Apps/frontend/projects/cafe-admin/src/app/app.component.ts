import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import {
  RealtimeService,
  ToastsComponent,
  ToastService,
} from '../../../shared-lib/src/public-api';
import {
  NewOrderAlertEventPayload,
  newOrderAlertRoom,
} from 'sbc-cafe-shared-module';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, ToastsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly toastService = inject(ToastService);
  private readonly realtimeService = inject(RealtimeService);
  private readonly destroySubject = new Subject<void>();

  ngOnInit(): void {
    const checkAndRegister = () => {
      if (this.realtimeService.isReady()) {
        this.realtimeService.joinNewOrderAlert();
        this.realtimeService
          .registerEventListener<NewOrderAlertEventPayload>(
            newOrderAlertRoom(),
            (event): void => {
              this.toastService.showInfo(
                `New order received: ${event.payload.orderId}`,
              );
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
    this.destroySubject.next();
    this.destroySubject.complete();
  }
}
