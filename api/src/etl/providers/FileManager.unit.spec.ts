import {
  axios,
  AxiosError,
  join,
  mkdir,
  Readable,
  readFileSync,
  rmSync,
} from "@/deps.ts";
import {
  afterAll,
  assert,
  assertEquals,
  beforeEach,
  describe,
  it,
  sinon,
} from "@/dev_deps.ts";
import { hash, writeFile } from "../helpers/index.ts";
import { FileManager } from "./FileManager.ts";

describe("File Manager", () => {
  const GEO_PERIMETER_TMP_DIR = "/tmp/perimeter-geo-test";
  const RESSOURCE_URL =
    "http://www.get.domaine.fr/system/files/documents/2022/09/file";
  const axiosStub = sinon.stub(axios, "get");
  const FILE_CONTENT_STRING = "{}";
  let READABLE_STREAM: Readable;
  let fileManager: FileManager;

  afterAll(() => {
    rmSync(GEO_PERIMETER_TMP_DIR, { recursive: true, force: true });
    axiosStub.restore();
  });

  beforeEach(() => {
    rmSync(GEO_PERIMETER_TMP_DIR, { recursive: true, force: true });

    fileManager = new FileManager({
      basePath: GEO_PERIMETER_TMP_DIR,
      downloadPath: `${GEO_PERIMETER_TMP_DIR}/download`,
      mirrorUrl: "https://s3.domain.fr/bucket",
    });

    axiosStub.reset();

    READABLE_STREAM = new Readable();
    READABLE_STREAM.push(FILE_CONTENT_STRING);
    READABLE_STREAM.push(null);
  });

  it("should return ressource file if available", async () => {
    // Arrange
    const existingFilepath = join(
      fileManager.downloadPath,
      hash(RESSOURCE_URL),
    );
    await mkdir(fileManager.downloadPath, { recursive: true });
    await writeFile(READABLE_STREAM, existingFilepath);

    // Act
    const filepath = await fileManager.download(
      RESSOURCE_URL,
    );

    // Assert
    sinon.assert.notCalled(axiosStub);
    assertEquals(readFileSync(filepath, "utf8"), FILE_CONTENT_STRING);
  });

  it("should download ressource url if not on fs", async () => {
    // Arrange
    axiosStub.resolves({ data: READABLE_STREAM });

    // Act
    const filepath = await fileManager.download(
      RESSOURCE_URL,
    );

    // Assert
    sinon.assert.calledOnceWithExactly(
      axiosStub,
      RESSOURCE_URL,
      { responseType: "stream" },
    );
    assertEquals(readFileSync(filepath, "utf8"), FILE_CONTENT_STRING);
  });

  it("should fallback to miror if any error code with download ressource", async () => {
    // Arrange
    axiosStub.onCall(0).callsFake(() => {
      throw new AxiosError("Invalid URL", "403");
    });
    axiosStub.onCall(1).resolves({ data: READABLE_STREAM });

    // Act
    const filepath = await fileManager.download(
      RESSOURCE_URL,
    );

    // Assert
    sinon.assert.calledTwice(axiosStub);
    assert(
      axiosStub.getCall(0).calledWithExactly(
        RESSOURCE_URL,
        {
          responseType: "stream",
        },
      ),
    );
    assert(
      axiosStub
        .getCall(1)
        .calledWithExactly(
          `${fileManager.mirrorUrl}/${hash(RESSOURCE_URL)}`,
          {
            responseType: "stream",
          },
        ),
    );
    assertEquals(readFileSync(filepath, "utf8"), FILE_CONTENT_STRING);
  });
});
