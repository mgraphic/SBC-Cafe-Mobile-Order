import { InjectionToken, TemplateRef } from '@angular/core';
import { ObservableInput } from 'rxjs';

export const toastTypes = ['info', 'error', 'success', 'warning'] as const;

export const TOAST_CONFIG = new InjectionToken<ToastConfig>('TOAST_CONFIG');

export const defaultToastEntityOptions: Omit<
  RequiredToastEntityOptions,
  'content' | 'id'
> = {
  type: 'info',
  ariaLive: 'polite',
  autohide: true,
  style: {},
};

export const defaultToastConfig: Readonly<RequiredToastConfig> = {
  animation: true,
  delay: {
    error: 23_000,
    info: 12_000,
    success: 9000,
    warning: 15_000,
  },
  className: 'toast-wrapper',
};

export type ToastType = (typeof toastTypes)[number];

export interface ToastConfig {
  animation?: boolean;
  delay?: Partial<Record<ToastType, number>>;
  className?: string;
}

export type RequiredToastConfig = Required<ToastConfig> & {
  className: Required<NonNullable<ToastConfig['className']>>;
  delay: Required<NonNullable<ToastConfig['delay']>>;
};

export type ToastContent = TemplateRef<any> | string;

export interface ToastEntity {
  type?: ToastType;
  ariaLive?: 'assertive' | 'polite';
  autohide?: boolean;
  content: ToastContent;
  toastClass?: string;
  style?: Partial<CSSStyleDeclaration>;
  delay?: number;
  header?: ToastContent;
  hideObserver?: ObservableInput<any>;
}

export type RequiredToastEntityOptions = ToastEntity &
  Required<Pick<ToastEntity, 'type' | 'autohide' | 'ariaLive' | 'style'>> & {
    id: string;
  };

export type ToastOptions = Omit<ToastEntity, 'content' | 'type'>;
