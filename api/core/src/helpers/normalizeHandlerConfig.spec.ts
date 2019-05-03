import { describe } from 'mocha';
import { expect, assert } from 'chai';

import { MethodNotFoundException } from '../exceptions/MethodNotFoundException';
import { getConfigBySignature, getSignatureByConfig } from './normalizeHandlerConfig';

describe('Helpers: resolve method', () => {
  it('from string works', () => {
    const { method, service, version } = getConfigBySignature('service@0.0.1:method');
    expect(method).equal('method');
    expect(service).equal('service');
    expect(version).equal('0.0.1');
  });

  it('from string works with default version', () => {
    const { method, service, version } = getConfigBySignature('service:method');
    expect(method).equal('method');
    expect(service).equal('service');
    expect(version).equal('latest');
  });

  it('from string works raise error', () => {
    assert.throw(
      () => getConfigBySignature(':method'),
      MethodNotFoundException,
      'Method not found',
    ); // Invalid method string (:method)

    assert.throw(
      () => getConfigBySignature('service:'),
      MethodNotFoundException,
      'Method not found',
    ); // Invalid method string (service:)

    assert.throw(
      () => getConfigBySignature('service:0.0.1'),
      MethodNotFoundException,
      'Method not found',
    ); // Invalid method string (service:0.0.1)
  });

  it('from object works', () => {
    const method = getSignatureByConfig({ service: 'service', method: 'method', version: '0.0.1' });
    expect(method).equal('service@0.0.1:method');
  });

  it('from object works with default version', () => {
    const method = getSignatureByConfig({ service: 'service', method: 'method' });
    expect(method).equal('service@latest:method');
  });

  it('from object works raise error', () => {
    assert.throw(
      () => getSignatureByConfig({ service: 'service', method: '' }),
      MethodNotFoundException,
      'Method not found', // Invalid method object (service:service, method:, version:undefined)
    );
    assert.throw(
      () => getSignatureByConfig({ service: '', method: 'method' }),
      MethodNotFoundException,
      'Method not found', // Invalid method object (service:, method:method, version:undefined)
      );
  });
});
