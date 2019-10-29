import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export const bankValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  if (
    formGroup.get('bank_name').value ||
    formGroup.get('client_name').value ||
    formGroup.get('iban').value ||
    formGroup.get('bic').value
  ) {
    if (
      formGroup.get('bank_name').value &&
      formGroup.get('client_name').value &&
      formGroup.get('iban').value &&
      formGroup.get('bic').value
    ) {
      return null;
    }
    return { allBankFieldsRequired: true };
  }
  return null;
};
