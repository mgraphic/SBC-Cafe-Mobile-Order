import { Observable, take, tap } from 'rxjs';
import { AnyEventPayload, RealtimeEventListener } from 'sbc-cafe-shared-module';

/**
 * Extends the shared RealtimeEventListener with an rxjs-compatible `takeUntil` overload.
 */
export class RealtimeEventListenerWithObservable<
  T extends AnyEventPayload,
> extends RealtimeEventListener<T> {
  public constructor(listener: RealtimeEventListener<T>) {
    // Re-use the underlying listener by copying its reference via the shared base
    super(
      (listener as any).realtimeService,
      (listener as any).eventName,
      (listener as any).callback,
    );
  }

  public takeUntilObservable(
    someObservable$: Observable<unknown>,
  ): RealtimeEventListenerWithObservable<T> {
    someObservable$
      .pipe(
        take(1),
        tap(() =>
          console.log(
            'takeUntil emitted, unsubscribing from event',
            (this as any).eventName,
          ),
        ),
      )
      .subscribe(() => {
        this.off();
      });

    this.on();

    return this;
  }
}
