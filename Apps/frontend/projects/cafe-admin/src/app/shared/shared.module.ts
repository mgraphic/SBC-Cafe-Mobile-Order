import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [],
  imports: [CommonModule, CurrencyPipe, FormsModule],
  exports: [CommonModule, CurrencyPipe, FormsModule],
})
export class SharedModule {}
