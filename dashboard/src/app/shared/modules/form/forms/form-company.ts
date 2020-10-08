import { FormControl, Validators } from '@angular/forms';

import { Company } from '~/core/entities/shared/company';
import { REGEXP } from '~/core/const/validators.const';

export interface StructureWithCompany {
  siret: string;
  company: Company;
}

export class FormCompany {
  siret = new FormControl(null, {
    updateOn: 'blur',
  });
  naf_entreprise = new FormControl();
  nature_juridique = new FormControl();
  rna = new FormControl();
  vat_intra = new FormControl();

  constructor(structure: StructureWithCompany) {
    const company = structure.company;

    this.siret.setValue(structure.siret);
    this.siret.setValidators([Validators.pattern(REGEXP.siret)]);

    this.naf_entreprise.setValue(company.naf_entreprise);
    this.naf_entreprise.setValidators([Validators.pattern(REGEXP.naf)]);
    this.naf_entreprise.disable();

    this.nature_juridique.setValue(company.nature_juridique);
    this.nature_juridique.disable();

    this.rna.setValue(company.rna);
    this.rna.setValidators([Validators.pattern(REGEXP.rna)]);
    this.rna.disable();

    this.vat_intra.setValue(company.vat_intra);
    this.vat_intra.setValidators([Validators.pattern(REGEXP.vatIntra)]);
    this.vat_intra.disable();
  }
}
