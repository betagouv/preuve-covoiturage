import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export const uniqueRetributionValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  // return null;

  const errors = [];
  let hasErrors = false;

  for (const retribution of formGroup.value) {
    const hasError =
      retribution.for_passenger.free !== true && !retribution.for_passenger.amount && !retribution.for_driver.amount;

    errors.push(hasError);
    hasErrors = hasErrors || hasError;
  }

  return hasErrors
    ? {
        uniqueRetribution: errors,
      }
    : null;
};
