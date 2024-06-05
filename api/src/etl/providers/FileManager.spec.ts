import anyTest, { TestFn } from 'ava';
import { FileManager } from './FileManager.ts';
import sinon, { SinonStub } from 'sinon';
import axios, { AxiosError } from 'axios';
import { Readable } from 'stream';
import { rmSync, readFileSync } from 'node:fs';
import { hash, writeFile } from '../helpers/index.ts';
import { join } from 'node:path';
import { mkdir } from 'fs/promises';

interface Context {
  // Constants
  RESSOURCE_URL: string;
  GEO_PERIMETER_TMP_DIR: string;
  READABLE_STREAM: Readable;

  // Injected tokens method's stubs
  axiosStub: SinonStub;

  // Tested token
  fileManager: FileManager;
}

const test = anyTest as TestFn<Context>;

const FILE_CONTENT_STRING = '{}';

test.before((t) => {
  t.context.GEO_PERIMETER_TMP_DIR = '/tmp/perimeter-geo-test';
  t.context.RESSOURCE_URL = 'http://www.get.domaine.fr/system/files/documents/2022/09/file';

  t.context.axiosStub = sinon.stub(axios, 'get');
});

test.after((t) => {
  rmSync(t.context.GEO_PERIMETER_TMP_DIR, { recursive: true, force: true });
  t.context.axiosStub.restore();
});

test.beforeEach((t) => {
  rmSync(t.context.GEO_PERIMETER_TMP_DIR, { recursive: true, force: true });

  t.context.fileManager = new FileManager({
    basePath: t.context.GEO_PERIMETER_TMP_DIR,
    downloadPath: `${t.context.GEO_PERIMETER_TMP_DIR}/download`,
    mirrorUrl: 'https://s3.domain.fr/bucket',
  });

  t.context.axiosStub.reset();

  t.context.READABLE_STREAM = new Readable();
  t.context.READABLE_STREAM.push(FILE_CONTENT_STRING);
  t.context.READABLE_STREAM.push(null);
});

test.serial('should return ressource file if available', async (t) => {
  // Arrange
  const existingFilepath = join(t.context.fileManager.downloadPath, hash(t.context.RESSOURCE_URL));
  await mkdir(t.context.fileManager.downloadPath, { recursive: true });
  await writeFile(t.context.READABLE_STREAM, existingFilepath);

  // Act
  const filepath = await t.context.fileManager.download(t.context.RESSOURCE_URL);

  // Assert
  sinon.assert.notCalled(t.context.axiosStub);
  t.deepEqual(readFileSync(filepath, 'utf8'), FILE_CONTENT_STRING);
});

test.serial('should download ressource url if not on fs', async (t) => {
  // Arrange
  t.context.axiosStub.resolves({ data: t.context.READABLE_STREAM });

  // Act
  const filepath = await t.context.fileManager.download(t.context.RESSOURCE_URL);

  // Assert
  sinon.assert.calledOnceWithExactly(t.context.axiosStub, t.context.RESSOURCE_URL, { responseType: 'stream' });
  t.deepEqual(readFileSync(filepath, 'utf8'), FILE_CONTENT_STRING);
});

test.serial('should fallback to miror if any error code with download ressource', async (t) => {
  // Arrange
  t.context.axiosStub.onCall(0).callsFake(() => {
    throw new AxiosError('Invalid URL', '403');
  });
  t.context.axiosStub.onCall(1).resolves({ data: t.context.READABLE_STREAM });

  // Act
  const filepath = await t.context.fileManager.download(t.context.RESSOURCE_URL);

  // Assert
  sinon.assert.calledTwice(t.context.axiosStub);
  t.true(t.context.axiosStub.getCall(0).calledWithExactly(t.context.RESSOURCE_URL, { responseType: 'stream' }));
  t.true(
    t.context.axiosStub
      .getCall(1)
      .calledWithExactly(`${t.context.fileManager.mirrorUrl}/${hash(t.context.RESSOURCE_URL)}`, {
        responseType: 'stream',
      }),
  );
  t.deepEqual(readFileSync(filepath, 'utf8'), FILE_CONTENT_STRING);
});
