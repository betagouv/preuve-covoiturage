import { FormBuilder, FormGroup } from '@angular/forms';
import { FormAddress } from '../../../shared/modules/form/forms/form-address';
import { FormContact } from '../../../shared/modules/form/forms/form-contact';
import { Address } from '../shared/address';
// eslint-disable-next-line max-len
import { CreateTerritoryGroupInterface } from './../../../../../../shared/territory/common/interfaces/TerritoryInterface';
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
      contacts: fb.group({
        gdpr_dpo: fb.group(new FormContact()),
        gdpr_controller: fb.group(new FormContact()),
        technical: fb.group(new FormContact()),
      }),
    });
    const model: CreateTerritoryGroupInterface = TerritoryMapper.toModel(territoryForm, null, [66666, 66664]);
    expect(model.name).toEqual("Communauté de communes du Pays de L'Arbresle");
    expect(model.selector._id).toEqual([66666, 66664]);
    expect(model.address.street).toEqual('117 RUE PIERRE PASSEMARD');
    expect(model.address.city).toEqual("L'ARBRESLE");
    expect(model.address.postcode).toEqual('69210');
    expect(model.company_id).toEqual(null);
    expect(model.contacts.gdpr_controller).toBeUndefined();
  });
});
