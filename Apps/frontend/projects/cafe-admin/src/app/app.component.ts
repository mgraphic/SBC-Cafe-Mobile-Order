import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  viewChild,
  ChangeDetectionStrategy,
  signal,
  model,
} from '@angular/core';
import type { IUser, UserOnDutyUpdate } from 'sbc-cafe-shared-module';
import { MatSelectModule } from '@angular/material/select';
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
  OnDutyAlertEventPayload,
} from 'sbc-cafe-shared-module';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  debounceTime,
  filter,
  map,
  skip,
  Subject,
  take,
  takeUntil,
} from 'rxjs';
import { UserService } from '../../../shared-lib/src/lib/services/user.service';
import { AuthService } from './shared/services/auth.service';
import { UsersService } from './shared/services/users.service';

const STAFF_ON_DUTY_DEBOUNCE_MS = 1200;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, ToastsComponent, MatSelectModule],
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
  private readonly usersService = inject(UsersService);

  private syncedStaffOnDuty?: Set<string>;
  private newOrderListener?: { off: () => unknown };
  private readonly destroySubject = new Subject<void>();
  protected readonly environment = environment;
  protected readonly user = signal(this.authService.getUser());
  protected readonly staffOptions = signal<IUser[]>([]);
  protected readonly staffOnDuty = model<string[]>([]);

  constructor() {
    toObservable(this.staffOnDuty)
      .pipe(
        debounceTime(STAFF_ON_DUTY_DEBOUNCE_MS),
        takeUntil(this.destroySubject),
      )
      .subscribe((staffOnDuty) => this.updateStaffOnDuty(staffOnDuty));
  }

  ngOnInit(): void {
    this.registerRealtimeListeners();

    // Login replaces the socket, so listeners must be registered again
    this.authService.isLoggedIn$
      .pipe(skip(1), filter(Boolean), takeUntil(this.destroySubject))
      .subscribe(() => {
        this.newOrderListener?.off();
        this.registerRealtimeListeners();
      });

    // Fetch initial staff on duty list
    this.usersService
      .getUsers(true)
      .pipe(take(1))
      .subscribe((staff) => {
        this.staffOptions.set(staff);
        this.fetchStaffOnDuty();
      });
  }

  private fetchStaffOnDuty(): void {
    this.usersService
      .getUsersOnDuty()
      .pipe(
        take(1),
        map((staffResponse) => staffResponse.data?.map((user) => user.id)),
      )
      .subscribe((staffOnDuty) => {
        // Record server state first so the sync below isn't echoed back
        this.syncedStaffOnDuty = new Set(staffOnDuty ?? []);
        this.staffOnDuty.set(staffOnDuty ?? []);
      });
  }

  private updateStaffOnDuty(staffOnDuty: string[]): void {
    if (!this.syncedStaffOnDuty) {
      return;
    }

    const selected = new Set(staffOnDuty);
    const synced = this.syncedStaffOnDuty;
    const updates: UserOnDutyUpdate[] = this.staffOptions()
      .filter((user) => selected.has(user.id) !== synced.has(user.id))
      .map((user) => ({ id: user.id, onDuty: selected.has(user.id) }));

    if (updates.length === 0) {
      return;
    }

    this.syncedStaffOnDuty = selected;
    this.usersService
      .usersOnDuty(updates)
      .pipe(take(1))
      .subscribe({ error: () => this.fetchStaffOnDuty() });
  }

  private registerRealtimeListeners(): void {
    this.realtimeService.onReady(() => {
      if (this.destroySubject.closed || this.destroySubject.isStopped) {
        return;
      }

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

      this.realtimeService.joinOnDutyAlert();
      this.realtimeService
        .registerEventListener<OnDutyAlertEventPayload>(
          'on-duty-alerts',
          (): void => {
            this.fetchStaffOnDuty();
          },
        )
        .takeUntilObservable(this.destroySubject);
    });
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }
}
