import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'euro',
})
export class EuroPipe implements PipeTransform {
  transform(val: number | string, length = 2): string {
    const num: number = isNaN(val as number) === false ? (val as number) : parseFloat(val as string);
    return `${num.toFixed(length).replace('.', ',')} €`;
  }
}
