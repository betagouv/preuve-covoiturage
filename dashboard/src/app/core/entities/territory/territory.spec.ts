import { FormBuilder, FormGroup } from '@angular/forms';
import { TerritoryBaseInterface } from '../../../../../../shared/territory/common/interfaces/TerritoryInterface';
import { FormAddress } from '../../../shared/modules/form/forms/form-address';
import { FormCompany } from '../../../shared/modules/form/forms/form-company';
import { FormContact } from '../../../shared/modules/form/forms/form-contact';
import { TerritoryLevelEnum } from '../api/shared/territory/common/interfaces/TerritoryInterface';

import { Address } from '../shared/address';
import { Company } from '../shared/company';
import { Contact } from '../shared/contact';
import { TerritoryMapper } from './territory';

describe('TerritoryMapper', () => {
  it('should map form values to territory model', () => {
    const fb = new FormBuilder();
    const territoryForm: FormGroup = fb.group({
      name: ["Communauté de communes du Pays de L'Arbresle"],
      inseeString: [''],
      address: fb.group(
        new FormAddress(
          new Address({
            street: '117 RUE PIERRE PASSEMARD',
            city: "L'ARBRESLE",
            country: null,
            postcode: '69210',
          }),
        ),
      ),
      company: fb.group(new FormCompany({ siret: '246900625', company: new Company() })),
      contacts: fb.group({
        gdpr_dpo: fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
        gdpr_controller: fb.group(
          new FormContact(
            new Contact({
              firstname: null,
              lastname: null,
              email: null,
            }),
          ),
        ),
        technical: fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
      }),
    });
    const model: TerritoryBaseInterface = TerritoryMapper.toModel(territoryForm, null, null);
    expect(model.name).toEqual("Communauté de communes du Pays de L'Arbresle");
    expect(model.children).toEqual([66666, 66664]);
    expect(model.address.street).toEqual('117 RUE PIERRE PASSEMARD');
    expect(model.address.city).toEqual("L'ARBRESLE");
    expect(model.address.postcode).toEqual('69210');
    expect(model.company_id).toEqual(null);
    expect(model.contacts.gdpr_controller).toEqual(null);
  });

  it('should map territory model to form values', () => {
    const territory: TerritoryBaseInterface = {
      name: "Communauté de communes du Pays de L'Arbresle",
      level: TerritoryLevelEnum.Towngroup,
      address: { street: '', postcode: '', city: '', country: 'France' },
      children: [66666, 66664],
    };
    const form: FormGroup = TerritoryMapper.toForm(territory);
    expect(form.contains('name')).toBeTrue();
    expect(form.contains('level')).toBeTrue();
    expect(form.contains('adress')).toBeTrue();
    expect(form.contains('inseeString')).toBeTrue();
  });
});
