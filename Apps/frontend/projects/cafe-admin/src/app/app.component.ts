import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { environment } from '../../../shared-lib/src/environment';
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
import { UserService } from '../../../shared-lib/src/lib/services/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, ToastsComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly newOrderToastRef =
    viewChild<TemplateRef<{ $implicit: NewOrderAlertEventPayload }>>(
      'newOrderToast',
    );
  private readonly toastService = inject(ToastService);
  private readonly realtimeService = inject(RealtimeService);
  protected readonly userService = inject(UserService);

  private readonly destroySubject = new Subject<void>();
  protected readonly environment = environment;

  ngOnInit(): void {
    const checkAndRegister = () => {
      if (this.realtimeService.isReady()) {
        this.realtimeService.joinNewOrderAlert();
        this.realtimeService
          .registerEventListener<NewOrderAlertEventPayload>(
            newOrderAlertRoom(),
            (event): void => {
              this.toastService.showInfo(this.newOrderToastRef()!, {
                contentContext: { $implicit: event.payload },
              });
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
