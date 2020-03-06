import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export const phoneIdentityValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  if (/^\+[1-9]{3,4}[0-9]{8}$/.test(formGroup.value as string)) {
    return null;
  }
  return { phoneIdentity: true };
};
