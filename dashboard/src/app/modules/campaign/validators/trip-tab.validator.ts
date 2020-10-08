import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export const tripTabValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  if (formGroup.get('blackList').value.length > 0 || formGroup.get('whiteList').value.length > 0) {
    return null;
  }
  return { tripEmptyList: true };
};
