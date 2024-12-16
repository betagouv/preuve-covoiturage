import { assertEquals, describe, it } from "@/dev_deps.ts";
import { sha256sum } from "@/lib/crypto/index.ts";
import { getTmpDir, remove, writeSync } from "@/lib/file/index.ts";

describe("crypto:sha256sum", () => {
  it("should return the correct hash", async () => {
    // create the file
    const path = getTmpDir() + "/hello.txt";
    writeSync(path, "Hello World", { create: true });

    // check the hash
    const sha = await sha256sum(path);
    assertEquals(sha, "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e");

    // remove the file
    remove(path);
  });
});
