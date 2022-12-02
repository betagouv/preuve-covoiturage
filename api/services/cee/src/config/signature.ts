import { env } from '@ilos/core';
import { readFileSync } from 'fs';

function getKey(type: string): string {
  const asVarEnvName = `APP_CEE_${type}_KEY`;
  const asPathEnvName = `APP_CEE_${type}_KEY_PATH`;

  if (asVarEnvName in process.env) {
    return env(asVarEnvName).toString().replace(/\\n/g, '\n');
  } else if (asPathEnvName in process.env) {
    return readFileSync(env(asPathEnvName) as string, 'utf-8');
  } else {
    throw new Error(`Var ${asVarEnvName} not found`);
  }
}

export const public_key = getKey('PUBLIC');
export const private_key = getKey('PRIVATE');
