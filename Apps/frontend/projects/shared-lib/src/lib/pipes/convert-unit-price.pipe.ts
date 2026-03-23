import { Pipe, PipeTransform } from '@angular/core';
import { convertUnitPrice } from '../utilities/catalog.utils';

@Pipe({
  name: 'convertUnitPrice',
})
export class ConvertUnitPricePipe implements PipeTransform {
  transform(value: number | string, ...args: unknown[]): number {
    return convertUnitPrice(value);
  }
}
