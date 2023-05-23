import { ConfigStore } from '@ilos/core/dist/extensions';
import test from 'ava';
import axios from 'axios';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { BucketName } from './interfaces/BucketName';
import { S3StorageProvider } from './S3StorageProvider';

test('should be uploading file with bucket as sub-domain', async (t) => {
  process.env.AWS_BUCKET_EXPORT_URL = 'https://s3.covoiturage.test';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const s3 = new S3StorageProvider(new ConfigStore({}));
  await s3.init();
  const filename = 'test2.csv';
  const filecontent = { hello: 'world' };
  const filepath = join(tmpdir(), filename);
  await writeFile(filepath, JSON.stringify(filecontent));
  await s3.upload(BucketName.Export, filepath, filename);
  const url = await s3.getPublicUrl(BucketName.Export, filename);
  const response = await axios.get(url);
  t.deepEqual(filecontent, response.data);
  delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
});
