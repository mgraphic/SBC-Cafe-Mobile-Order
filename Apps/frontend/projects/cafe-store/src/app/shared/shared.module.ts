import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [CommonModule, CurrencyPipe],
  exports: [CommonModule, CurrencyPipe],
})
export class SharedModule {}
