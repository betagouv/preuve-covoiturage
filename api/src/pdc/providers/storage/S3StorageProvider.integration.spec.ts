import { assertObjectMatch, it } from "@/dev_deps.ts";
import { ConfigStore } from "@/ilos/core/extensions/index.ts";
import fetcher from "@/lib/fetcher/index.ts";
import { getTmpDir } from "@/lib/file/index.ts";
import { join } from "@/lib/path/index.ts";
import { writeFile } from "dep:fs-promises";
import { S3StorageProvider } from "./S3StorageProvider.ts";
import { BucketName } from "./interfaces/BucketName.ts";

it("should be uploading file with bucket as sub-domain", async () => {
  const config = new ConfigStore({});
  const s3 = new S3StorageProvider(config);
  await s3.init();

  const filename = "test2.csv";
  const filecontent = { hello: "world" };
  const filepath = join(getTmpDir(), filename);

  await writeFile(filepath, JSON.stringify(filecontent));
  await s3.upload(BucketName.Export, filepath, filename);
  const url = await s3.getPublicUrl(BucketName.Export, filename);

  const response = await fetcher.get(url);
  const obj = await response.json();

  assertObjectMatch(filecontent, obj);
});
