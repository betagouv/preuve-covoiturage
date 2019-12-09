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

const defaultCopy = (source: any, propertyName: string) => source[propertyName];

export function assignOrDeleteProperty<PropT>(
  source: any,
  dest: any,
  propertyName: string,
  copyFunc: (source: any, propertyName: string) => PropT = defaultCopy,
) {
  if (source && hasOneNotEmptyProperty(source[propertyName])) {
    dest[propertyName] = copyFunc(source, propertyName);
  } else {
    delete dest[propertyName];
  }
}

export function assignOrDeleteProperties<PropT>(
  source: any,
  dest: any,
  propertyNames: string[],
  copyFunc: (source: any, propertyName: string) => PropT = defaultCopy,
) {
  for (const propName of propertyNames) assignOrDeleteProperty(source, dest, propName);
}

export function copyOnlyDefineSourceProperties<DestT>(source: any, destination: DestT): DestT {
  Object.keys(destination).forEach((propName) => {
    if (source[propName]) destination[propName] = source[propName];
  });

  return destination;
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
