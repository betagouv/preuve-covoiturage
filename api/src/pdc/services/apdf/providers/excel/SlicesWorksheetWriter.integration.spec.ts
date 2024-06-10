import {
  afterAll,
  afterEach,
  assert,
  assertEquals,
  assertFalse,
  assertObjectMatch,
  assertThrows,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@/dev_deps.ts";
import { excel } from "@/deps.ts";
import { SliceStatInterface } from "@/shared/apdf/interfaces/PolicySliceStatInterface.ts";
import { BuildExcel } from "./BuildExcel.ts";
import { SlicesWorksheetWriter } from "./SlicesWorksheetWriter.ts";

interface Context {
  // Injected tokens

  // Injected tokens method's stubs

  // Tested token
  slicesWorksheetWriter: SlicesWorksheetWriter;

  // Constants
  FILEPATH: string;
}

const test = anyTest as TestFn<Partial<Context>>;

beforeEach((t) => {
  t.context.FILEPATH = "/tmp/stream-data-test.xlsx";
  t.context.slicesWorksheetWriter = new SlicesWorksheetWriter();
});

afterEach((t) => {});

it("SlicesWorkbookWriter: should map slice into a dedicated worksheet", async (t) => {
  // Arrange
  const slices: SliceStatInterface[] = [
    {
      slice: { start: 0, end: 2000 },
      count: 2500,
      sum: 154588,
      subsidized: 2400,
    },
    {
      slice: { start: 2000, end: 30000 },
      count: 3000,
      sum: 204598,
      subsidized: 2500,
    },
    { slice: { start: 30000 }, count: 5000, sum: 304456, subsidized: 4000 },
  ];

  // Act
  const workbookWriter: excel.stream.xlsx.WorkbookWriter = BuildExcel
    .initWorkbookWriter(t.context.FILEPATH!);
  await t.context.slicesWorksheetWriter!.call(workbookWriter, slices);
  await workbookWriter.commit();

  // Assert
  const workbook: excel.Workbook = await new excel.Workbook().xlsx.readFile(
    t.context.FILEPATH!,
  );
  const worksheet: excel.Worksheet = workbook.getWorksheet(
    t.context.slicesWorksheetWriter!.WORKSHEET_NAME,
  );

  // Header 'normale'
  assertEquals(
    worksheet.getCell("A1").value,
    t.context.slicesWorksheetWriter!.COLUMN_HEADERS_NORMAL[0],
  );
  assertEquals(
    worksheet.getCell("B1").value,
    t.context.slicesWorksheetWriter!.COLUMN_HEADERS_NORMAL[1],
  );
  assertEquals(
    worksheet.getCell("C1").value,
    t.context.slicesWorksheetWriter!.COLUMN_HEADERS_NORMAL[2],
  );
  assertEquals(
    worksheet.getCell("D1").value,
    t.context.slicesWorksheetWriter!.COLUMN_HEADERS_NORMAL[3],
  );

  // Data
  /* eslint-disable prettier/prettier,max-len */
  assertEquals(
    worksheet.getCell("A2").value,
    `Jusqu'à ${slices[0].slice.end / 1000} km`,
  );
  assertObjectMatch(worksheet.getCell("B2").value, {
    formula:
      'SUMIFS(Trajets!R:R,Trajets!S:S,"normale",Trajets!M:M,">=0",Trajets!M:M,"<2000")',
  });
  assertObjectMatch(worksheet.getCell("C2").value, {
    formula:
      'COUNTIFS(Trajets!S:S,"normale",Trajets!M:M,">=0",Trajets!M:M,"<2000")',
  });
  assertObjectMatch(worksheet.getCell("D2").value, {
    formula:
      'COUNTIFS(Trajets!R:R,">0",Trajets!S:S,"normale",Trajets!M:M,">=0",Trajets!M:M,"<2000")',
  });

  assertEquals(
    worksheet.getCell("A3").value,
    `De ${slices[1].slice.start / 1000} km à ${slices[1].slice.end / 1000} km`,
  );
  assertObjectMatch(worksheet.getCell("B3").value, {
    formula:
      'SUMIFS(Trajets!R:R,Trajets!S:S,"normale",Trajets!M:M,">=2000",Trajets!M:M,"<30000")',
  });
  assertObjectMatch(worksheet.getCell("C3").value, {
    formula:
      'COUNTIFS(Trajets!S:S,"normale",Trajets!M:M,">=2000",Trajets!M:M,"<30000")',
  });
  assertObjectMatch(worksheet.getCell("D3").value, {
    formula:
      'COUNTIFS(Trajets!R:R,">0",Trajets!S:S,"normale",Trajets!M:M,">=2000",Trajets!M:M,"<30000")',
  });

  assertEquals(
    worksheet.getCell("A4").value,
    `Supérieure à ${slices[2].slice.start / 1000} km`,
  );
  assertObjectMatch(worksheet.getCell("B4").value, {
    formula: 'SUMIFS(Trajets!R:R,Trajets!S:S,"normale",Trajets!M:M,">=30000")',
  });
  assertObjectMatch(worksheet.getCell("C4").value, {
    formula: 'COUNTIFS(Trajets!S:S,"normale",Trajets!M:M,">=30000")',
  });
  assertObjectMatch(worksheet.getCell("D4").value, {
    formula:
      'COUNTIFS(Trajets!R:R,">0",Trajets!S:S,"normale",Trajets!M:M,">=30000")',
  });

  /* eslint-enable prettier/prettier,max-len */
});
