import { Injectable, signal } from '@angular/core';
import { RequiredToastEntityOptions } from '../models/toast.model';

@Injectable()
export class ToastControllerService {
  private readonly toastsSignal = signal<RequiredToastEntityOptions[]>([]);
  public readonly toasts = this.toastsSignal.asReadonly();

  public add(toast: RequiredToastEntityOptions) {
    this.toastsSignal.update((toasts) => [...toasts, toast]);
  }

  public remove(toast: RequiredToastEntityOptions) {
    this.toastsSignal.update((toasts) => toasts.filter((t) => t !== toast));
  }

  public clear() {
    this.toastsSignal.set([]);
  }
}
