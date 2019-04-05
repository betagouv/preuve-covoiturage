import mathjs from 'mathjs';
import { Directive, forwardRef, Input } from '@angular/core';
import { FormControl, NG_VALIDATORS } from '@angular/forms';

import { IncentiveParameter } from '~/entities/database/Incentive/incentiveParameter';

@Directive({
  selector: '[appValidateFormula][ngModel],[appValidateFormula][formControl]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormulaValidatorDirective),
      multi: true,
    },
  ],
})

export class FormulaValidatorDirective {
  @Input('appValidateFormula') formulaParameters: [];

  validate(c: FormControl) {
    const parameters = this.formulaParameters
      .map((param: IncentiveParameter) => param.varname)
      .reduce(
        (values, varname) => {
          values[varname] = 0;
          return values;
        },
        {},
      );

    // TODO check this
    if (c.value) {
      try {
        const result = mathjs.eval(c.value, parameters);
        console.log({ result });
        // if (!Number.isNaN(result)) {
        //   throw new Error();
        // }
        return null;
      } catch (e) {
        console.log({ e });
        // throw e;
      }
    }

    return {
      validateFormula: {
        valid: false,
      },
    };
  }
}
