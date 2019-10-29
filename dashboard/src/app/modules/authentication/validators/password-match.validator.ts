import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  if (formGroup.get('new_password').value === formGroup.get('password_verification').value) {
    return null;
  }
  return { passwordMismatch: true };
};
