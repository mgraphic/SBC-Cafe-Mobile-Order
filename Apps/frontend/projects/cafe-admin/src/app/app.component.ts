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
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type {
  IUser,
  StoreState,
  StoreStatusEventPayload,
  UserOnDutyUpdate,
} from 'sbc-cafe-shared-module';
import { MatSelectModule } from '@angular/material/select';
import { environment } from '../../../shared-lib/src/environment';
import { RouterModule, RouterOutlet } from '@angular/router';
import {
  RealtimeService,
  ToastsComponent,
  ToastService,
  SharedModule,
  StoreService,
} from '../../../shared-lib/src/public-api';
import { UserService } from '../../../shared-lib/src/lib/services/user.service';
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
import { AuthService } from './shared/services/auth.service';
import { UsersService } from './shared/services/users.service';
import { ModalComponent } from './shared/components/modal/modal.component';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap/modal';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    MatSelectModule,
    ModalComponent,
    NgbModalModule,
    RouterModule,
    RouterOutlet,
    SharedModule,
    ToastsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AppComponent implements OnInit, OnDestroy {
  private static readonly STAFF_ON_DUTY_DEBOUNCE_MS = 1200;

  private readonly newOrderToastRef =
    viewChild<TemplateRef<{ $implicit: NewOrderAlertEventPayload }>>(
      'newOrderToast',
    );

  private readonly openStoreTemplateRef =
    viewChild<TemplateRef<any>>('openStoreTemplate');

  private readonly toastService = inject(ToastService);
  private readonly realtimeService = inject(RealtimeService);
  protected readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly storeService = inject(StoreService);
  private readonly modalService = inject(NgbModal);

  protected readonly environment = environment;
  protected readonly user = signal(this.authService.getUser());
  protected readonly staffOptions = signal<IUser[]>([]);
  protected readonly staffOnDuty = model<string[]>([]);
  protected readonly isOpen = signal(false);
  protected readonly durationSelect = model<number>(0);
  private readonly storeState = signal<StoreState | null>(null);

  protected readonly durationOptions = [
    { label: '30 seconds', value: 30_000 },
    { label: '15 minutes', value: 900_000 },
    { label: '30 minutes', value: 1_800_000 },
    { label: '1 hour', value: 3_600_000 },
    { label: '2 hours', value: 7_200_000 },
  ];
  private readonly destroySubject = new Subject<void>();
  private timer?: ReturnType<typeof setInterval>;
  private syncedStaffOnDuty?: Set<string>;
  private newOrderListener?: { off: () => unknown };

  public constructor() {
    effect(() => {
      const storeState = this.storeState();

      clearTimeout(this.timer);

      if (!storeState) {
        this.isOpen.set(false);
        return;
      }

      const now = new Date();
      const later = new Date(storeState.timestamp);

      if (now.getTime() - later.getTime() < storeState.duration) {
        this.isOpen.set(true);
        this.timer = setTimeout(
          () => {
            this.isOpen.set(false);
          },
          storeState.duration - (now.getTime() - later.getTime()),
        );
      } else {
        this.isOpen.set(false);
      }
    });

    toObservable(this.staffOnDuty)
      .pipe(
        debounceTime(AppComponent.STAFF_ON_DUTY_DEBOUNCE_MS),
        takeUntil(this.destroySubject),
      )
      .subscribe((staffOnDuty) => this.updateStaffOnDuty(staffOnDuty));
  }

  public ngOnInit(): void {
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

    // Fetch initial store state
    this.storeService
      .getStoreStatus()
      .pipe(take(1))
      .subscribe((storeState) => {
        this.storeState.set(storeState);
      });
  }

  public ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  protected toggleStoreOpen(): void {
    if (!this.userService.hasRole('ADMIN')) {
      return;
    }

    if (this.isOpen()) {
      this.storeService.closeStore().pipe(take(1)).subscribe();
      return;
    }

    this.modalService.open(this.openStoreTemplateRef());
  }

  protected openStore(duration: number): void {
    if (this.userService.hasRole('ADMIN')) {
      this.storeService.openStore(duration).pipe(take(1)).subscribe();
    }
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

      this.realtimeService.joinStoreStatusAlert();
      this.realtimeService
        .registerEventListener<StoreStatusEventPayload>(
          'store-status-alerts',
          (event): void => {
            const storeState = event.payload;

            if (!storeState || !storeState.isStoreOpen) {
              this.storeState.set(null);
              return;
            }

            this.storeState.set({
              timestamp: new Date().toISOString(),
              duration: storeState.storeOpenDuration ?? 0,
            });
          },
        )
        .takeUntilObservable(this.destroySubject);
    });
  }
}
