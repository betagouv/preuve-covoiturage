import { KeywordDefinition } from '@ilos/validator';

import { base64Macro } from './macros/base64Macro';
import { lonMacro } from './macros/lonMacro';
import { latMacro } from './macros/latMacro';
import { bicMacro } from './macros/bicMacro';
import { euVatMacro } from './macros/euVatMacro';
import { groupMacro } from './macros/groupMacro';
import { ibanMacro } from './macros/ibanMacro';
import { inseeMacro } from './macros/inseeMacro';
import { departmentMacro } from './macros/departmentMacro';
import { countryMacro } from './macros/countryMacro';
import { nafMacro } from './macros/nafMacro';
import { nicMacro } from './macros/nicMacro';
import { dbidMacro } from './macros/dbidMacro';
import { phoneMacro } from './macros/phoneMacro';
import { phonetruncMacro } from './macros/phonetruncMacro';
import { postcodeMacro } from './macros/postcodeMacro';
import { sirenMacro } from './macros/sirenMacro';
import { siretMacro } from './macros/siretMacro';
import { timestampMacro } from './macros/timestampMacro';
import { varcharMacro } from './macros/varcharMacro';
import { emailMacro } from './macros/emailMacro';
import { passwordMacro } from './macros/passwordMacro';
import { rnaMacro } from './macros/rnaMacro';
import { roleMacro } from './macros/roleMacro';
import { serialMacro } from './macros/serialMacro';
import { tokenMacro } from './macros/tokenMacro';
import { tzMacro } from './macros/tzMacro';
import { uuidMacro } from './macros/uuidMacro';
import { longcharMacro } from './macros/longcharMacro';
import { permissionsMacro } from './macros/permissionsMacro';
import { integerMacro } from './macros/integerMacro';
import { jwtMacro } from './macros/jwtMacro';

const macroStore = {
  base64: base64Macro,
  bic: bicMacro,
  dbid: dbidMacro,
  email: emailMacro,
  euvat: euVatMacro,
  group: groupMacro,
  iban: ibanMacro,
  insee: inseeMacro,
  department: departmentMacro,
  country: countryMacro,
  integer: integerMacro,
  jwt: jwtMacro,
  lat: latMacro,
  longchar: longcharMacro,
  lon: lonMacro,
  naf: nafMacro,
  nic: nicMacro,
  password: passwordMacro,
  permissions: permissionsMacro,
  phone: phoneMacro,
  phonetrunc: phonetruncMacro,
  postcode: postcodeMacro,
  rna: rnaMacro,
  role: roleMacro,
  serial: serialMacro,
  siren: sirenMacro,
  siret: siretMacro,
  timestamp: timestampMacro,
  createdat: timestampMacro,
  updatedat: timestampMacro,
  deletedat: timestampMacro,
  token: tokenMacro,
  tz: tzMacro,
  uuid: uuidMacro,
  varchar: varcharMacro,
};

export const macroKeyword: KeywordDefinition = {
  keyword: 'macro',
  macro(schema: string): { [k: string]: any } {
    if (schema in macroStore) {
      return macroStore[schema]();
    }
    return {};
  },
  metaSchema: {
    type: 'string',
    enum: Object.keys(macroStore),
  },
};
