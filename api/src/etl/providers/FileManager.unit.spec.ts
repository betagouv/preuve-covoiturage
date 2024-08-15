import { mkdir, readFile, rm } from "@/deps.ts";
import {
  afterAll,
  assertEquals,
  assertSpyCall,
  assertSpyCalls,
  beforeEach,
  describe,
  it,
  stub,
} from "@/dev_deps.ts";
import { createHash } from "@/lib/crypto/index.ts";
import { join } from "@/lib/path/index.ts";
import fetcher from "../../lib/fetcher/index.ts";
import { writeFile } from "../helpers/index.ts";
import { FileManager } from "./FileManager.ts";

describe("File Manager", () => {
  const GEO_PERIMETER_TMP_DIR = "/tmp/perimeter-geo-test";
  const RESSOURCE_URL =
    "http://www.get.domaine.fr/system/files/documents/2022/09/file";
  const FILE_CONTENT_STRING = "{}";
  let READABLE_STREAM: ReadableStream;
  let fileManager: FileManager;

  afterAll(async () => {
    await rm(GEO_PERIMETER_TMP_DIR, { recursive: true, force: true });
  });

  beforeEach(async () => {
    await rm(GEO_PERIMETER_TMP_DIR, { recursive: true, force: true });

    fileManager = new FileManager({
      basePath: GEO_PERIMETER_TMP_DIR,
      downloadPath: `${GEO_PERIMETER_TMP_DIR}/download`,
      mirrorUrl: "https://s3.domain.fr/bucket",
    });

    READABLE_STREAM = new ReadableStream({
      start(controller) {
        // Convert the text to a Uint8Array (or other suitable format) and enqueue it
        controller.enqueue(new TextEncoder().encode(FILE_CONTENT_STRING));
        // Close the stream after the text has been enqueued
        controller.close();
      },
    });
  });

  it("should return ressource file if available", async () => {
    const getStub = stub(fetcher, "get");
    try {
      // Arrange
      const existingFilepath = join(
        fileManager.downloadPath,
        await createHash(RESSOURCE_URL),
      );
      await mkdir(fileManager.downloadPath, { recursive: true });
      await writeFile(READABLE_STREAM, existingFilepath);

      // Act
      const filepath = await fileManager.download(
        RESSOURCE_URL,
      );
      assertEquals(await readFile(filepath, "utf8"), FILE_CONTENT_STRING);
    } finally {
      getStub.restore();
    }
    // Assert
    assertSpyCalls(getStub, 0);
  });

  it("should download ressource url if not on fs", async () => {
    // Arrange
    const getStub = stub(
      fetcher,
      "get",
      async () => new Response(READABLE_STREAM),
    );
    try {
      // Act
      const filepath = await fileManager.download(
        RESSOURCE_URL,
      );
      assertEquals(await readFile(filepath, "utf8"), FILE_CONTENT_STRING);
    } finally {
      getStub.restore();
    }
    // Assert
    assertSpyCall(getStub, 0, { args: [RESSOURCE_URL] });
  });

  it("should fallback to miror if any error code with download ressource", async () => {
    // Arrange
    let nb = 0;
    const getStub = stub(
      fetcher,
      "get",
      async () => {
        if (nb === 0) {
          nb += 1;
          throw new Error("Invalid URL");
        } else {
          return new Response(READABLE_STREAM);
        }
      },
    );

    try {
      // Act
      const filepath = await fileManager.download(
        RESSOURCE_URL,
      );
      assertEquals(await readFile(filepath, "utf8"), FILE_CONTENT_STRING);
    } finally {
      getStub.restore();
    }

    // Assert
    assertSpyCalls(getStub, 2);
    assertSpyCall(getStub, 0, { args: [RESSOURCE_URL] });
    assertSpyCall(getStub, 1, {
      args: [`${fileManager.mirrorUrl}/${await createHash(RESSOURCE_URL)}`],
    });
  });
});
