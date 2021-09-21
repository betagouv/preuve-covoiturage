import { ConfigStore } from '@ilos/core/dist/extensions';
import test from 'ava';
import https from 'https';
import axios from 'axios';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { BucketName } from './interfaces/BucketName';
import { S3StorageProvider } from './S3StorageProvider';

test('should be uploading file', async (t) => {
  process.env.AWS_S3_PATH_STYLE = 'true';
  process.env.AWS_BUCKET_EXPORT_URL = 'https://s3.covoiturage.test';
  const s3 = new S3StorageProvider(new ConfigStore({}));
  await s3.init();
  const filename = 'test1.csv';
  const filecontent = { hello: 'world' };
  const filepath = join(tmpdir(), filename);
  await writeFile(filepath, JSON.stringify(filecontent));
  await s3.upload(BucketName.Export, filepath, filename);
  const url = await s3.getPublicUrl(BucketName.Export, filename);
  const response = await axios.get(url);
  t.deepEqual(filecontent, response.data);
});

test('should be uploading file with domain', async (t) => {
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });
  process.env.AWS_S3_PATH_STYLE = 'false';
  process.env.AWS_BUCKET_EXPORT_URL = 'https://local-pdc-export.s3.covoiturage.test';
  const s3 = new S3StorageProvider(
    new ConfigStore({
      file: {
        bucket: {
          options: {
            httpOptions: {
              agent: httpsAgent,
            },
          },
        },
      },
    }),
  );
  await s3.init();
  const filename = 'test2.csv';
  const filecontent = { hello: 'world' };
  const filepath = join(tmpdir(), filename);
  await writeFile(filepath, JSON.stringify(filecontent));
  await s3.upload(BucketName.Export, filepath, filename);
  const url = await s3.getPublicUrl(BucketName.Export, filename);
  const response = await axios.get(url, { httpsAgent });
  t.deepEqual(filecontent, response.data);
});
