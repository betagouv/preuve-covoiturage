import { ValidatorExtension as ValidatorParentExtension } from '@ilos/validator';
import { ValidatorInterfaceResolver, ServiceContainerInterface, extension } from '@ilos/common';

import { bicCustomFormat } from './formats/bicCustomFormat';
import { coordinatesKeyword } from './keywords/coordinatesKeyword';
import { countryCustomFormat } from './formats/countryCustomFormat';
import { departmentCustomFormat } from './formats/departmentCustomFormat';
import { euVatCustomFormat } from './formats/euVatCustomFormat';
import { ibanCustomFormat } from './formats/ibanCustomFormat';
import { inseeCustomFormat } from './formats/inseeCustomFormat';
import { nafCustomFormat } from './formats/nafCustomFormat';
import { nicCustomFormat } from './formats/nicCustomFormat';
import { objectidCustomFormat } from './formats/objectidCustomFormat';
import { phoneCustomFormat } from './formats/phoneCustomFormat';
import { phonetruncCustomFormat } from './formats/phonetruncCustomFormat';
import { postcodeCustomFormat } from './formats/postcodeCustomFormat';
import { rnaCustomFormat } from './formats/rnaCustomFormat';
import { sirenCustomFormat } from './formats/sirenCustomFormat';
import { siretCustomFormat } from './formats/siretCustomFormat';

import { macroKeyword } from './keywords/macroKeyword';
import { castKeyword } from './keywords/castKeyword';
import { sanitizeKeyword } from './keywords/sanitizeKeyword';

@extension({
  name: 'validator',
  autoload: true,
  override: true,
})
export class ValidatorExtension extends ValidatorParentExtension {
  async init(serviceContainer: ServiceContainerInterface): Promise<void> {
    const validator = serviceContainer.getContainer().get(ValidatorInterfaceResolver);

    // register string formats
    validator.registerCustomKeyword({ name: 'bic', type: 'format', definition: bicCustomFormat });
    validator.registerCustomKeyword({ name: 'country', type: 'format', definition: countryCustomFormat });
    validator.registerCustomKeyword({ name: 'department', type: 'format', definition: departmentCustomFormat });
    validator.registerCustomKeyword({ name: 'euvat', type: 'format', definition: euVatCustomFormat });
    validator.registerCustomKeyword({ name: 'iban', type: 'format', definition: ibanCustomFormat });
    validator.registerCustomKeyword({ name: 'insee', type: 'format', definition: inseeCustomFormat });
    validator.registerCustomKeyword({ name: 'naf', type: 'format', definition: nafCustomFormat });
    validator.registerCustomKeyword({ name: 'nic', type: 'format', definition: nicCustomFormat });
    validator.registerCustomKeyword({ name: 'objectid', type: 'format', definition: objectidCustomFormat });
    validator.registerCustomKeyword({ name: 'phone', type: 'format', definition: phoneCustomFormat });
    validator.registerCustomKeyword({ name: 'phonetrunc', type: 'format', definition: phonetruncCustomFormat });
    validator.registerCustomKeyword({ name: 'postcode', type: 'format', definition: postcodeCustomFormat });
    validator.registerCustomKeyword({ name: 'rna', type: 'format', definition: rnaCustomFormat });
    validator.registerCustomKeyword({ name: 'siren', type: 'format', definition: sirenCustomFormat });
    validator.registerCustomKeyword({ name: 'siret', type: 'format', definition: siretCustomFormat });

    // register keywords (compile)
    validator.registerCustomKeyword({ type: 'keyword', definition: coordinatesKeyword });

    // register macros
    validator.registerCustomKeyword({ type: 'keyword', definition: macroKeyword });
    validator.registerCustomKeyword({ type: 'keyword', definition: castKeyword });
    validator.registerCustomKeyword({ type: 'keyword', definition: sanitizeKeyword });
    await super.init(serviceContainer);

    // dump the registered schema for debug - uncomment for use
    // if (require('@ilos/core').env.or_fail('APP_ENV', 'unknown') === 'local') {
    //   //@ts-ignore
    //   [...validator.bindings].map((b) => {
    //     console.info(b[0], b[1].schema);
    //   });
    // }
  }
}
