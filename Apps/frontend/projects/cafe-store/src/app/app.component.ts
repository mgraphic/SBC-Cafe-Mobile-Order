import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterOutlet,
  type ActivatedRouteSnapshot,
} from '@angular/router';
import type {
  StoreState,
  StoreStatusEventPayload,
} from 'sbc-cafe-shared-module';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SharedModule, StoreService } from '../../../shared-lib/src/public-api';
import { RealtimeService } from '../../../shared-lib/src/lib/services/realtime.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SharedModule],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  protected readonly showHeader = signal(true);
  protected readonly showFooter = signal(true);
  private readonly isOpen = signal<boolean | null>(null);
  private readonly storeState = signal<StoreState | null>(null);
  private readonly allowWhenStoreClosed = signal(false);

  private readonly destroyRef = inject(DestroyRef);
  private readonly realtimeService = inject(RealtimeService);
  private readonly storeService = inject(StoreService);
  private readonly router = inject(Router);

  private storeStatusTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const storeState = this.storeState();

      clearTimeout(this.storeStatusTimeout);

      if (!storeState) {
        this.isOpen.set(null);
        return;
      }

      const now = new Date();
      const later = new Date(storeState.timestamp);

      if (now.getTime() - later.getTime() < storeState.duration) {
        this.isOpen.set(true);
        this.storeStatusTimeout = setTimeout(
          () => {
            this.isOpen.set(false);
          },
          storeState.duration - (now.getTime() - later.getTime()),
        );
      } else {
        this.isOpen.set(false);
      }
    });

    effect(() => {
      if (this.isOpen() === false && !this.allowWhenStoreClosed()) {
        this.router.navigateByUrl('/store-closed');
      } else if (
        this.isOpen() === true &&
        this.router.url === '/store-closed'
      ) {
        this.router.navigateByUrl('/menu');
      }
    });

    this.destroyRef.onDestroy(() => clearTimeout(this.storeStatusTimeout));
  }

  ngOnInit(): void {
    this.allowWhenStoreClosed.set(this.isActiveRouteAllowedWhenStoreClosed());

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.allowWhenStoreClosed.set(
            this.isActiveRouteAllowedWhenStoreClosed(),
          );

          switch (event.urlAfterRedirects) {
            case '/':
            case '/store-closed':
              this.showHeader.set(false);
              this.showFooter.set(false);
              break;
            default:
              this.showHeader.set(true);
              this.showFooter.set(true);
              break;
          }
        }
      });

    this.realtimeService.onReady(() => {
      if (this.destroyRef.destroyed) {
        return;
      }

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
        .takeUntilDestroyRef(this.destroyRef);
    });

    // Fetch initial store state
    this.storeService
      .getStoreStatus()
      .pipe(take(1))
      .subscribe((storeState) => {
        this.storeState.set(storeState);
      });
  }

  private isActiveRouteAllowedWhenStoreClosed(): boolean {
    let route: ActivatedRouteSnapshot | null =
      this.router.routerState.snapshot.root;

    while (route !== null) {
      if (route.data['allowWhenStoreClosed'] === true) {
        return true;
      }

      route = route.firstChild;
    }

    return false;
  }
}
