import { KeywordDefinition } from '/ilos/validator/index.ts';

import { base64Macro } from './macros/base64Macro.ts';
import { lonMacro } from './macros/lonMacro.ts';
import { latMacro } from './macros/latMacro.ts';
import { bicMacro } from './macros/bicMacro.ts';
import { euVatMacro } from './macros/euVatMacro.ts';
import { groupMacro } from './macros/groupMacro.ts';
import { ibanMacro } from './macros/ibanMacro.ts';
import { inseeMacro } from './macros/inseeMacro.ts';
import { departmentMacro } from './macros/departmentMacro.ts';
import { countryMacro } from './macros/countryMacro.ts';
import { nafMacro } from './macros/nafMacro.ts';
import { nicMacro } from './macros/nicMacro.ts';
import { dbidMacro } from './macros/dbidMacro.ts';
import { phoneMacro } from './macros/phoneMacro.ts';
import { phonetruncMacro } from './macros/phonetruncMacro.ts';
import { postcodeMacro } from './macros/postcodeMacro.ts';
import { sirenMacro } from './macros/sirenMacro.ts';
import { siretMacro } from './macros/siretMacro.ts';
import { timestampMacro } from './macros/timestampMacro.ts';
import { varcharMacro } from './macros/varcharMacro.ts';
import { emailMacro } from './macros/emailMacro.ts';
import { passwordMacro } from './macros/passwordMacro.ts';
import { rnaMacro } from './macros/rnaMacro.ts';
import { roleMacro } from './macros/roleMacro.ts';
import { serialMacro } from './macros/serialMacro.ts';
import { tokenMacro } from './macros/tokenMacro.ts';
import { tzMacro } from './macros/tzMacro.ts';
import { uuidMacro } from './macros/uuidMacro.ts';
import { longcharMacro } from './macros/longcharMacro.ts';
import { permissionsMacro } from './macros/permissionsMacro.ts';
import { integerMacro } from './macros/integerMacro.ts';
import { jwtMacro } from './macros/jwtMacro.ts';

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
