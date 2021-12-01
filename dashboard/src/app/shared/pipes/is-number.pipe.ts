import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isNumber',
})
export class IsNumberPipe implements PipeTransform {
  transform(val: any): boolean {
    return isNaN(val) === false;
  }
}
