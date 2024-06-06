import { ConfigStore } from '@/ilos/core/extensions/index.ts';
import { anyTest as test } from '@/dev_deps.ts';
import axios from 'axios';
import { writeFile } from 'node:fs/promises';
import https from 'node:https';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BucketName } from './interfaces/BucketName.ts';
import { S3StorageProvider } from './S3StorageProvider.ts';

test('should be uploading file with bucket as sub-domain', async (t) => {
  t.log('Start test');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  // disable https checking
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });

  // const requestHandler = new NodeHttp2Handler({});
  // const config = new ConfigStore({ storage: { bucket: { options: { requestHandler } } } });
  const config = new ConfigStore({});

  process.env.AWS_ENDPOINT = 'https://s3.covoiturage.test';
  const s3 = new S3StorageProvider(config);

  t.log(`Init s3 client`);
  await s3.init();

  const filename = 'test2.csv';
  const filecontent = { hello: 'world' };
  const filepath = join(tmpdir(), filename);

  t.log(`Write file to ${filepath}`);
  await writeFile(filepath, JSON.stringify(filecontent));

  t.log(`Start uploading ${filename} to bucket: ${BucketName.Export}`);
  const key = await s3.upload(BucketName.Export, filepath, filename);
  t.log(`Uploaded ${filename} to ${key}`);

  const url = await s3.getPublicUrl(BucketName.Export, filename);
  t.log(`Public URL: ${url}`);

  const response = await axios.get(url, { httpsAgent });
  t.log(`Response: ${JSON.stringify(response.data)}`);

  t.deepEqual(filecontent, response.data);
});
