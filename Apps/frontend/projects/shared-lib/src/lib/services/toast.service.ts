import { Injectable, OnDestroy, inject } from '@angular/core';
import {
  ToastEntity,
  ToastContent,
  ToastOptions,
  RequiredToastEntityOptions,
  defaultToastEntityOptions,
} from '../models/toast.model';
import { ToastControllerService } from './toast-controller.service';

@Injectable()
export class ToastService implements OnDestroy {
  private toastControllerService = inject(ToastControllerService);

  public ngOnDestroy(): void {
    this.clear();
  }

  public show(toastOrContent: ToastEntity | ToastContent) {
    if (this.isToastEntity(toastOrContent)) {
      this.showToastEntity(toastOrContent);
      return;
    }

    this.showToastEntity({ content: toastOrContent });
  }

  public clear() {
    this.toastControllerService.clear();
  }

  public showInfo(toastContent: ToastContent, options: ToastOptions = {}) {
    this.showToastEntity({
      ...options,
      type: 'info',
      content: toastContent,
    });
  }

  public showSuccess(toastContent: ToastContent, options: ToastOptions = {}) {
    this.showToastEntity({
      ...options,
      type: 'success',
      content: toastContent,
    });
  }

  public showWarning(toastContent: ToastContent, options: ToastOptions = {}) {
    this.showToastEntity({
      ...options,
      type: 'warning',
      content: toastContent,
    });
  }

  public showError(toastContent: ToastContent, options: ToastOptions = {}) {
    this.showToastEntity({
      ...options,
      type: 'error',
      content: toastContent,
    });
  }

  private showToastEntity(toast: ToastEntity) {
    const toastOptions = this.getOptionsWithDefaults(toast);
    this.toastControllerService.add(toastOptions);
  }

  private isToastEntity(obj: any): obj is ToastEntity {
    return obj && typeof obj === 'object' && 'content' in obj;
  }

  private getOptionsWithDefaults(
    options: ToastEntity,
  ): RequiredToastEntityOptions {
    return {
      ...defaultToastEntityOptions,
      ...options,
      id: crypto.randomUUID(),
    } as RequiredToastEntityOptions;
  }
}
