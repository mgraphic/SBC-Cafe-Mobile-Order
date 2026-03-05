import { Injectable, signal, Inject } from '@angular/core';
import {
  RequiredToastConfig,
  TOAST_CONFIG,
  ToastConfig,
  defaultToastConfig,
} from '../models/toast.model';

@Injectable()
export class ToastConfigService {
  private readonly toastConfig: RequiredToastConfig;
  private readonly invertedSignal = signal<boolean>(false);
  public readonly inverted = this.invertedSignal.asReadonly();

  public constructor(@Inject(TOAST_CONFIG) config?: ToastConfig) {
    this.toastConfig = {
      ...defaultToastConfig,
      ...config,
    } as RequiredToastConfig;
  }

  public getConfig(): RequiredToastConfig {
    return this.toastConfig;
  }

  public setInverted(value: boolean) {
    this.invertedSignal.set(value);
  }

  public toggleInverted() {
    this.invertedSignal.update((current) => !current);
  }
}
