import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

function validIban(value: string) {
  const rearrange = value.substring(4, value.length) + value.substring(0, 4);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const alphaMap = {};
  const nm = [];

  alphabet.forEach((val, index) => {
    alphaMap[val] = index + 10;
  });

  rearrange.split('').forEach((value, index) => {
    nm[index] = alphaMap[value] || value;
  });

  const cleanIban = nm.join('').toString();
  const res = modulo(cleanIban, 97) === 1;
  return res;
}

function modulo(aNumStr, aDiv) {
  let tmp = '';
  let r;

  // tslint:disable-next-line: no-increment-decrement
  for (let i = 0; i < aNumStr.length; i++) {
    tmp += aNumStr.charAt(i);
    r = parseInt(tmp, 10) % aDiv;
    tmp = r.toString();
  }
  return parseInt(tmp, 10);
}

export const ibanValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null =>
  !validIban(formGroup.value) ? { ibanWrongFormat: true } : null;
