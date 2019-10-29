// import { FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
// import { evaluate as mathjsEval } from 'mathjs';
//
// import { IncentiveFormulaParameterInterface } from '~/core/interfaces/campaign/campaignInterface';
// import { CampaignService } from '~/modules/campaign/services/campaign.service';
//
// // tslint:disable-next-line:max-line-length
// export function formulaValidator(campaignService: CampaignService, formulaIndex: number): ValidatorFn {
//   return (control: FormControl): ValidationErrors | null => {
//     const formula = control.value;
//     const formulaParameters = campaignService._parameters$.value;
//     const formattedParameters = formulaParameters
//       .map((param: IncentiveFormulaParameterInterface) => param.varname)
//       // filter out varname that depend on previously calculated incentive
//       .filter((varname: string) => (formulaIndex === 0 ? varname.indexOf('incitation') === -1 : true))
//       .reduce((values, varname) => {
//         values[varname] = 1;
//         return values;
//       }, {});
//
//     if (!formula) {
//       return null;
//     }
//     try {
//       const result = mathjsEval(formula, formattedParameters);
//       if (typeof result === 'number') {
//         return null;
//       }
//     } catch (e) {
//       // console.log({ e });
//       // add type of errors ?
//     }
//     return {
//       incorrectFormula: true,
//     };
//   };
// }
