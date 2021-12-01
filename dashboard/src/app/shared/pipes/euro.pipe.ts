import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'euro',
})
export class EuroPipe implements PipeTransform {
  transform(val: number | string, length = 2): string {
    const str = String(val);
    const num = parseFloat(str);
    if (isNaN(num)) return str;
    return `${num.toFixed(length).replace('.', ',')} €`;
  }
}
