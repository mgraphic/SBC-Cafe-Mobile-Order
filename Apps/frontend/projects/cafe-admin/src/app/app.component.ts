import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  viewChild,
  ChangeDetectionStrategy,
  signal,
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
import { filter, skip, Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../shared-lib/src/lib/services/user.service';
import { AuthService } from './shared/services/auth.service';

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
  private readonly authService = inject(AuthService);

  private newOrderListener?: { off: () => unknown };
  private readonly destroySubject = new Subject<void>();
  protected readonly environment = environment;
  protected readonly user = signal(this.authService.getUser());

  ngOnInit(): void {
    this.registerNewOrderListener();

    // Login replaces the socket, so listeners must be registered again
    this.authService.isLoggedIn$
      .pipe(skip(1), filter(Boolean), takeUntil(this.destroySubject))
      .subscribe(() => {
        this.newOrderListener?.off();
        this.registerNewOrderListener();
      });
  }

  private registerNewOrderListener(): void {
    const checkAndRegister = () => {
      if (this.destroySubject.closed || this.destroySubject.isStopped) {
        return;
      }

      if (this.realtimeService.isReady()) {
        this.realtimeService.joinNewOrderAlert();
        this.newOrderListener = this.realtimeService
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
