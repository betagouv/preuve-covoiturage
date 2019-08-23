import { FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function requiredFileTypeValidator(type: string): ValidatorFn {
  return (control: FormControl): ValidationErrors | null => {
    const file = control.value;
    if (!file) {
      return null;
    }
    const extension = file.name.split('.')[1].toLowerCase();
    if (type.toLowerCase() !== extension.toLowerCase()) {
      return {
        requiredFileType: true,
      };
    }
  };
}
