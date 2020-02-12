import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export const tripLocationValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  // return null;

  console.log(formGroup.get('start'));

  if (
    (formGroup.get('start').value && formGroup.get('start').value.length > 0) ||
    (formGroup.get('end').value && formGroup.get('end').value.length > 0)
  ) {
    return null;
  }
  return { tripLocationRequired: true };
};
