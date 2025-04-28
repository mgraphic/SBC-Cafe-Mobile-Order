import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ENVIROMENT_INJECTION_TOKEN, environment } from './environment';

@NgModule({
  declarations: [],
  imports: [CommonModule, CurrencyPipe],
  exports: [CommonModule, CurrencyPipe],
  providers: [{ provide: ENVIROMENT_INJECTION_TOKEN, useValue: environment }],
})
export class SharedModule {}
