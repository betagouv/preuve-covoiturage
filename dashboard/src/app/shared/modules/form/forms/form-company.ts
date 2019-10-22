import { FormControl, Validators } from '@angular/forms';

import { Company } from '~/core/entities/shared/company';
import { REGEXP } from '~/core/const/validators.const';

export class FormCompany {
  siret = new FormControl();
  naf_entreprise = new FormControl(); // tslint:disable-line variable-name
  nature_juridique = new FormControl(); // tslint:disable-line variable-name
  rna = new FormControl();
  vat_intra = new FormControl(); // tslint:disable-line variable-name

  constructor(company: Company) {
    this.siret.setValue(company.siret);
    this.siret.setValidators([Validators.required, Validators.pattern(REGEXP.siret)]);

    this.naf_entreprise.setValue(company.naf_entreprise);
    this.naf_entreprise.setValidators([Validators.pattern(REGEXP.naf)]);

    this.nature_juridique.setValue(company.nature_juridique);

    this.rna.setValue(company.rna);
    this.rna.setValidators([Validators.pattern(REGEXP.rna)]);

    this.vat_intra.setValue(company.vat_intra);
    this.vat_intra.setValidators([Validators.pattern(REGEXP.vatIntra)]);
  }
}
