import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Moment } from 'moment';

export const dateRangeValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  const start: Moment = formGroup.get('date').get('start').value;
  const end: Moment = formGroup.get('date').get('end').value;

  if (!start || !end || end.isSameOrAfter(start)) {
    return null;
  }
  return { dateRange: true };
};
