import { describe } from 'mocha';
import { expect, assert } from 'chai';

import { resolveMethodFromString, resolveMethodFromObject } from './resolveMethod';

describe('Helpers: resolve method', () => {
  it('from string works', () => {
    const { method, service, version } = resolveMethodFromString('service@0.0.1:method');
    expect(method).equal('method');
    expect(service).equal('service');
    expect(version).equal('0.0.1');
  });

  it('from string works with default version', () => {
    const { method, service, version } = resolveMethodFromString('service:method');
    expect(method).equal('method');
    expect(service).equal('service');
    expect(version).equal('latest');
  });

  it('from string works raise error', () => {
    assert.throw(() => resolveMethodFromString(':method'), Error, 'Invalid method string (:method)');
    assert.throw(() => resolveMethodFromString('service:'), Error, 'Invalid method string (service:)');
    assert.throw(() => resolveMethodFromString('service:0.0.1'), Error, 'Invalid method string (service:0.0.1)');
  });

  it('from object works', () => {
    const method = resolveMethodFromObject({ service: 'service', method: 'method', version: '0.0.1' });
    expect(method).equal('service@0.0.1:method');
  });

  it('from object works with default version', () => {
    const method = resolveMethodFromObject({ service: 'service', method: 'method' });
    expect(method).equal('service@latest:method');
  });

  it('from object works raise error', () => {
    assert.throw(
      () => resolveMethodFromObject({ service: 'service', method: '' }),
      Error,
      `Invalid method object (service:service, method:, version:undefined)`,
    );
    assert.throw(
      () => resolveMethodFromObject({ service: '', method: 'method' }),
      Error,
      `Invalid method object (service:, method:method, version:undefined)`,
      );
  });
});
