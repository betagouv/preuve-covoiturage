import { env } from '@ilos/core/index.ts';
import { readFileSync } from 'node:fs';

function getKey(type: string): string {
  const asVarEnvName = `APP_CEE_${type}_KEY`;
  const asPathEnvName = `APP_CEE_${type}_KEY_PATH`;

  if (asVarEnvName in process.env) {
    return env.or_fail(asVarEnvName).toString().replace(/\\n/g, '\n');
  } else if (asPathEnvName in process.env) {
    return readFileSync(env.or_fail(asPathEnvName), 'utf-8');
  } else {
    throw new Error(`Var ${asVarEnvName} not found`);
  }
}

export const public_key = getKey('PUBLIC');
export const private_key = getKey('PRIVATE');
