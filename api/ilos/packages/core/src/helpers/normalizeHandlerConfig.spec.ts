import test from 'ava';
import { MethodNotFoundException } from '@ilos/common';

import { getConfigBySignature, getSignatureByConfig } from './normalizeHandlerConfig';

test('Helpers: normalize from string works', (t) => {
  const { method, service, version } = getConfigBySignature('service@0.0.1:method');
  t.is(method, 'method');
  t.is(service, 'service');
  t.is(version, '0.0.1');
});

test('Helpers: normalize from string works with default version', (t) => {
  const { method, service, version } = getConfigBySignature('service:method');
  t.is(method, 'method');
  t.is(service, 'service');
  t.is(version, 'latest');
});

test('Helpers: normalize from string works raise error', (t) => {
  t.throws<MethodNotFoundException>(() => getConfigBySignature(':method')); // Invalid method string (:method)
  t.throws<MethodNotFoundException>(() => getConfigBySignature('service:')); // Invalid method string (service:)
  t.throws<MethodNotFoundException>(() => getConfigBySignature('service:0.0.1')); // Invalid method string (service:0.0.1)
});

test('Helpers: normalize from object works', (t) => {
  const method = getSignatureByConfig({ service: 'service', method: 'method', version: '0.0.1' });
  t.is(method, 'service@0.0.1:method');
});

test('Helpers: normalize from object works with default version', (t) => {
  const method = getSignatureByConfig({ service: 'service', method: 'method' });
  t.is(method, 'service@latest:method');
});

test('Helpers: normalize from object works raise error', (t) => {
  t.throws<MethodNotFoundException>(() => getSignatureByConfig({ service: 'service', method: '' }));
  t.throws<MethodNotFoundException>(() => getSignatureByConfig({ service: '', method: 'method' }));
});
