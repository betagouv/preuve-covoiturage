import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { MethodNotFoundException } from '@/ilos/common/index.ts';

import { getConfigBySignature, getSignatureByConfig } from './normalizeHandlerConfig.ts';

it('Helpers: normalize from string works', (t) => {
  const { method, service, version } = getConfigBySignature('service@0.0.1:method');
  assertEquals(method, 'method');
  assertEquals(service, 'service');
  assertEquals(version, '0.0.1');
});

it('Helpers: normalize from string works with default version', (t) => {
  const { method, service, version } = getConfigBySignature('service:method');
  assertEquals(method, 'method');
  assertEquals(service, 'service');
  assertEquals(version, 'latest');
});

it('Helpers: normalize from string works raise error', (t) => {
  // Invalid method string (:method)
  t.throws<MethodNotFoundException>(() => getConfigBySignature(':method'));
  // Invalid method string (service:)
  t.throws<MethodNotFoundException>(() => getConfigBySignature('service:'));
  // Invalid method string (service:0.0.1)
  t.throws<MethodNotFoundException>(() => getConfigBySignature('service:0.0.1'));
});

it('Helpers: normalize from object works', (t) => {
  const method = getSignatureByConfig({ service: 'service', method: 'method', version: '0.0.1' });
  assertEquals(method, 'service@0.0.1:method');
});

it('Helpers: normalize from object works with default version', (t) => {
  const method = getSignatureByConfig({ service: 'service', method: 'method' });
  assertEquals(method, 'service@latest:method');
});

it('Helpers: normalize from object works raise error', (t) => {
  t.throws<MethodNotFoundException>(() => getSignatureByConfig({ service: 'service', method: '' }));
  t.throws<MethodNotFoundException>(() => getSignatureByConfig({ service: '', method: 'method' }));
});
