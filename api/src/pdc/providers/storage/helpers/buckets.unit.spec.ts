import { process } from "@/deps.ts";
import { assertEquals, it } from "@/dev_deps.ts";
import { BucketName } from "../interfaces/BucketName.ts";
import {
  getBucketEndpoint,
  getBucketName,
  getBucketPrefix,
} from "./buckets.ts";

it("[getBucketPrefix] returns AWS_BUCKET_PREFIX or empty", () => {
  process.env.AWS_BUCKET_PREFIX = "";
  assertEquals(getBucketPrefix(), "");

  process.env.AWS_BUCKET_PREFIX = "test";
  assertEquals(getBucketPrefix(), "test");
});

it("[getBucketEndpoint] no var, no prefix", () => {
  delete process.env.AWS_BUCKET_PREFIX;
  delete process.env.AWS_BUCKET_EXPORT_ENDPOINT;
  assertEquals(
    getBucketEndpoint("https://s3.test", BucketName.Export),
    "https://s3.test",
  );
});

it("[getBucketEndpoint] no var, with prefix", () => {
  process.env.AWS_BUCKET_PREFIX = "url-prefix";
  delete process.env.AWS_BUCKET_EXPORT_ENDPOINT;
  assertEquals(
    getBucketEndpoint("https://s3.test", BucketName.Export),
    "https://s3.test",
  );
});

it("[getBucketEndpoint] var override, no prefix", () => {
  delete process.env.AWS_BUCKET_PREFIX;
  process.env.AWS_BUCKET_EXPORT_ENDPOINT = "https://override-export.s3.test";
  assertEquals(
    getBucketEndpoint("https://s3.test", BucketName.Export),
    "https://override-export.s3.test",
  );
});

it("[getBucketName] no prefix", () => {
  delete process.env.AWS_BUCKET_PREFIX;
  assertEquals(getBucketName(BucketName.Export), "export");
});

it("[getBucketName] prefix", () => {
  process.env.AWS_BUCKET_PREFIX = "name-prefix";
  assertEquals(getBucketName(BucketName.Export), "name-prefix-export");
});
