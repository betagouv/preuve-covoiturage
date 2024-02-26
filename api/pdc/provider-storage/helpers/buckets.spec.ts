import test from 'ava';
import { BucketName } from '../interfaces/BucketName';
import { getBucketEndpoint, getBucketName, getBucketPrefix } from './buckets';

test('[getBucketPrefix] returns AWS_BUCKET_PREFIX or empty', (t) => {
  t.is(getBucketPrefix(), '');

  process.env.AWS_BUCKET_PREFIX = 'test';
  t.is(getBucketPrefix(), 'test');
});

test('[getBucketEndpoint] no var, no prefix', (t) => {
  delete process.env.AWS_BUCKET_PREFIX;
  delete process.env.AWS_BUCKET_EXPORT_ENDPOINT;
  t.is(getBucketEndpoint('https://s3.test', BucketName.Export), 'https://s3.test');
});

test('[getBucketEndpoint] no var, with prefix', (t) => {
  process.env.AWS_BUCKET_PREFIX = 'url-prefix';
  delete process.env.AWS_BUCKET_EXPORT_ENDPOINT;
  t.is(getBucketEndpoint('https://s3.test', BucketName.Export), 'https://s3.test');
});

test('[getBucketEndpoint] var override, no prefix', (t) => {
  delete process.env.AWS_BUCKET_PREFIX;
  process.env.AWS_BUCKET_EXPORT_ENDPOINT = 'https://override-export.s3.test';
  t.is(getBucketEndpoint('https://s3.test', BucketName.Export), 'https://override-export.s3.test');
});

test('[getBucketName] no prefix', (t) => {
  delete process.env.AWS_BUCKET_PREFIX;
  t.is(getBucketName(BucketName.Export), 'export');
});

test('[getBucketName] prefix', (t) => {
  process.env.AWS_BUCKET_PREFIX = 'name-prefix';
  t.is(getBucketName(BucketName.Export), 'name-prefix-export');
});
