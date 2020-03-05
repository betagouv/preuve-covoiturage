import { ValidatorFn, FormGroup, ValidationErrors } from '@angular/forms';

export const bicValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null =>
  !formGroup.value ||
  /^([A-Z]{6}[A-Z2-9][A-NP-Z1-2])(X{3}|[A-WY-Z0-9][A-Z0-9]{2})?$/.test(formGroup.value.toUpperCase())
    ? null
    : { bicWrongFormat: true };
