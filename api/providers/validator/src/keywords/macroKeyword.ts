import { lonMacro } from '../macros/lonMacro';
import { latMacro } from '../macros/latMacro';
import { bicMacro } from '../macros/bicMacro';
import { euVatMacro } from '../macros/euVatMacro';
import { ibanMacro } from '../macros/ibanMacro';
import { inseeMacro } from '../macros/inseeMacro';
import { nafMacro } from '../macros/nafMacro';
import { nicMacro } from '../macros/nicMacro';
import { dbidMacro } from '../macros/dbidMacro';
import { phoneMacro } from '../macros/phoneMacro';
import { phonetruncMacro } from '../macros/phonetruncMacro';
import { postcodeMacro } from '../macros/postcodeMacro';
import { sirenMacro } from '../macros/sirenMacro';
import { siretMacro } from '../macros/siretMacro';
import { timestampMacro } from '../macros/timestampMacro';
import { varcharMacro } from '../macros/varcharMacro';
import { emailMacro } from '../macros/emailMacro';
import { passwordMacro } from '../macros/passwordMacro';
import { rnaMacro } from '../macros/rnaMacro';
import { roleMacro } from '../macros/roleMacro';
import { serialMacro } from '../macros/serialMacro';
import { tokenMacro } from '../macros/tokenMacro';
import { uuidMacro } from '../macros/uuidMacro';
import { groupMacro } from '../macros/groupMacro';
import { longcharMacro } from '../macros/longcharMacro';
import { permissionsMacro } from '../macros/permissionsMacro';
import { integerMacro } from '../macros/integerMacro';
import { jwtMacro } from '../macros/jwtMacro';

const macroStore = {
  bic: bicMacro,
  euvat: euVatMacro,
  iban: ibanMacro,
  insee: inseeMacro,
  lat: latMacro,
  lon: lonMacro,
  naf: nafMacro,
  nic: nicMacro,
  dbid: dbidMacro,
  phone: phoneMacro,
  phonetrunc: phonetruncMacro,
  postcode: postcodeMacro,
  rna: rnaMacro,
  siren: sirenMacro,
  siret: siretMacro,
  createdat: timestampMacro,
  updatedat: timestampMacro,
  deletedat: timestampMacro,
  timestamp: timestampMacro,
  varchar: varcharMacro,
  longchar: longcharMacro,
  email: emailMacro,
  password: passwordMacro,
  role: roleMacro,
  serial: serialMacro,
  integer: integerMacro,
  uuid: uuidMacro,
  group: groupMacro,
  token: tokenMacro,
  jwt: jwtMacro,
  permissions: permissionsMacro,
};

export const macroKeyword = {
  name: 'macro',
  type: 'keyword',
  definition: {
    macro(schema: string, parentSchema, it): any {
      if (schema in macroStore) {
        return macroStore[schema](schema, parentSchema, it);
      }
    },
    metaSchema: {
      type: 'string',
      enum: Object.keys(macroStore),
    },
  },
};
