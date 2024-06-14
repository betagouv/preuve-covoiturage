import { join, process, tmpdir, writeFile } from "@/deps.ts";
import { assertObjectMatch, it } from "@/dev_deps.ts";
import { ConfigStore } from "@/ilos/core/extensions/index.ts";
import { S3StorageProvider } from "./S3StorageProvider.ts";
import { BucketName } from "./interfaces/BucketName.ts";

it("should be uploading file with bucket as sub-domain", async () => {
  console.debug("Start test");

  // disable https checking

  // const requestHandler = new NodeHttp2Handler({});
  // const config = new ConfigStore({ storage: { bucket: { options: { requestHandler } } } });
  const config = new ConfigStore({});

  process.env.AWS_ENDPOINT = "https://s3.covoiturage.test";
  const s3 = new S3StorageProvider(config);

  console.debug(`Init s3 client`);
  await s3.init();

  const filename = "test2.csv";
  const filecontent = { hello: "world" };
  const filepath = join(tmpdir(), filename);

  console.debug(`Write file to ${filepath}`);
  await writeFile(filepath, JSON.stringify(filecontent));

  console.debug(`Start uploading ${filename} to bucket: ${BucketName.Export}`);
  const key = await s3.upload(BucketName.Export, filepath, filename);
  console.debug(`Uploaded ${filename} to ${key}`);

  const url = await s3.getPublicUrl(BucketName.Export, filename);
  console.debug(`Public URL: ${url}`);

  const response = await fetch(url);
  const obj = await response.json();
  console.debug(`Response: ${JSON.stringify(obj)}`);

  assertObjectMatch(filecontent, obj);
});
