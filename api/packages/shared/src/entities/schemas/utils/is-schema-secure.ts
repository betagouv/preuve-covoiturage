// tslint doesn't like Ajv imports ;(
// tslint:disable-next-line
import Ajv from "ajv";
import { assert } from 'chai';
import { ValidateFunction } from 'ajv/lib/ajv';
import jsonSchemaSecureJson from 'ajv/lib/refs/json-schema-secure.json';

const ajv = new Ajv();

// validate Schema structure agains meta-schema
// https://github.com/epoberezkin/ajv#security-considerations

// wrap assert functions to nicely display schema debug errors in the console
const wrapAssertion = (assertFunction) => (
  schema: any,
  message?: string,
): void => {
  const isSchemaSecure: ValidateFunction = ajv.compile(jsonSchemaSecureJson);
  try {
    assertFunction(isSchemaSecure(schema), message);
  } catch (e) {
    console.log('    \x1b[31mSchema errors:\x1b[0m');
    console.log(
      isSchemaSecure.errors
        .map(
          (err) =>
            // tslint:disable-next-line: prefer-template
            `    - \x1b[33m${err.dataPath}` +
            `\x1b[0m \x1b[37m${err.message}\x1b[0m\n`,
        )
        .join(''),
    );

    throw e;
  }
};

const isSecure = wrapAssertion(assert.isOk);
const isNotSecure = wrapAssertion(assert.isNotOk);

export { isSecure, isNotSecure };
