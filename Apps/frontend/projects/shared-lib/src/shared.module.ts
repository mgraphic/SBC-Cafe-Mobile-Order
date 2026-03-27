import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ENVIROMENT_INJECTION_TOKEN, environment } from './environment';
import { ToastService } from './lib/services/toast.service';
import {
  defaultToastConfig,
  TOAST_CONFIG,
  ToastConfig,
} from './lib/models/toast.model';
import { ToastControllerService } from './lib/services/toast-controller.service';
import { ToastConfigService } from './lib/services/toast-config.service';
import { ConvertUnitPricePipe } from './lib/pipes/convert-unit-price.pipe';

@NgModule({
  declarations: [],
  imports: [CommonModule, CurrencyPipe, ConvertUnitPricePipe],
  exports: [CommonModule, CurrencyPipe, ConvertUnitPricePipe],
  providers: [{ provide: ENVIROMENT_INJECTION_TOKEN, useValue: environment }],
})
export class SharedModule {
  static forRoot(config?: {
    toast?: ToastConfig;
  }): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        ToastService,
        ToastControllerService,
        ToastConfigService,
        {
          provide: TOAST_CONFIG,
          useValue: config?.toast ?? defaultToastConfig,
        },
      ],
    };
  }
}
