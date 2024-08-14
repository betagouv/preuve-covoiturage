import { mkdir, readFile, rm } from "@/deps.ts";
import {
  afterAll,
  assert,
  assertEquals,
  beforeEach,
  describe,
  it,
  sinon,
} from "@/dev_deps.ts";
import { createHash } from "@/lib/crypto/index.ts";
import { join } from "@/lib/path/index.ts";
import { writeFile } from "../helpers/index.ts";
import { FileManager } from "./FileManager.ts";

describe("File Manager", () => {
  const GEO_PERIMETER_TMP_DIR = "/tmp/perimeter-geo-test";
  const RESSOURCE_URL =
    "http://www.get.domaine.fr/system/files/documents/2022/09/file";
  const fetchStub = sinon.stub(window, "fetch");
  const FILE_CONTENT_STRING = "{}";
  let READABLE_STREAM: ReadableStream;
  let fileManager: FileManager;

  afterAll(async () => {
    await rm(GEO_PERIMETER_TMP_DIR, { recursive: true, force: true });
    fetchStub.restore();
  });

  beforeEach(async () => {
    await rm(GEO_PERIMETER_TMP_DIR, { recursive: true, force: true });

    fileManager = new FileManager({
      basePath: GEO_PERIMETER_TMP_DIR,
      downloadPath: `${GEO_PERIMETER_TMP_DIR}/download`,
      mirrorUrl: "https://s3.domain.fr/bucket",
    });

    fetchStub.reset();

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

    // Assert
    sinon.assert.notCalled(fetchStub);
    assertEquals(await readFile(filepath, "utf8"), FILE_CONTENT_STRING);
  });

  it("should download ressource url if not on fs", async () => {
    // Arrange
    fetchStub.resolves({ data: READABLE_STREAM });

    // Act
    const filepath = await fileManager.download(
      RESSOURCE_URL,
    );

    // Assert
    sinon.assert.calledOnceWithExactly(
      fetchStub,
      RESSOURCE_URL,
      { responseType: "stream" },
    );
    assertEquals(await readFile(filepath, "utf8"), FILE_CONTENT_STRING);
  });

  it("should fallback to miror if any error code with download ressource", async () => {
    // Arrange
    fetchStub.onCall(0).callsFake(() => {
      throw new Error("Invalid URL");
    });
    fetchStub.onCall(1).resolves({ data: READABLE_STREAM });

    // Act
    const filepath = await fileManager.download(
      RESSOURCE_URL,
    );

    // Assert
    sinon.assert.calledTwice(fetchStub);
    assert(
      fetchStub.getCall(0).calledWithExactly(
        RESSOURCE_URL,
        {
          responseType: "stream",
        },
      ),
    );
    assert(
      fetchStub
        .getCall(1)
        .calledWithExactly(
          `${fileManager.mirrorUrl}/${await createHash(RESSOURCE_URL)}`,
          {
            responseType: "stream",
          },
        ),
    );
    assertEquals(await readFile(filepath, "utf8"), FILE_CONTENT_STRING);
  });
});
