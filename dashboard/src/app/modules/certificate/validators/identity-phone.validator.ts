import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export const phoneIdentityValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  if ((<string>formGroup.value).match(/^\+[1-9]{3}([0-9]{8})$/)) {
    return null;
  }
  return { phoneIdentity: true };
};
