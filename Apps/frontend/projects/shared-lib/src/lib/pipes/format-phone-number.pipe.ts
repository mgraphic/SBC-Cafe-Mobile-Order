import { Pipe, PipeTransform } from '@angular/core';
import { formatPhoneNumber } from '../utilities/format.utils';

@Pipe({
  name: 'formatPhoneNumber',
})
export class FormatPhoneNumberPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return formatPhoneNumber(value as string);
  }
}
