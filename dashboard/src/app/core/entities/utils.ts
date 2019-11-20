import { FormArray, FormGroup } from '@angular/forms';

export function hasOneNotEmptyProperty(object: any, maxRec = 3) {
  if (!object) return false;

  let hasNonEmpty = false;
  const values = Object.values(object);

  for (const val of values) {
    if (val) {
      if (typeof val === 'object') {
        if (maxRec) {
          hasNonEmpty = hasOneNotEmptyProperty(val, maxRec - 1);
        }
      } else {
        hasNonEmpty = true;
      }
      if (hasNonEmpty) break;
    }
  }

  return hasNonEmpty;
}

// return invalid controls names
export function findInvalidControlsRecursive(formToInvestigate: FormGroup | FormArray): string[] {
  const invalidControls: string[] = [];
  const recursiveFunc = (form: FormGroup | FormArray) => {
    Object.keys(form.controls).forEach((field) => {
      const control = form.get(field);
      if (control.invalid) invalidControls.push(field);
      if (control instanceof FormGroup) {
        recursiveFunc(control);
      } else if (control instanceof FormArray) {
        recursiveFunc(control);
      }
    });
  };
  recursiveFunc(formToInvestigate);
  return invalidControls;
}
