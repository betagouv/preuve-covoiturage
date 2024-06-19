import { excel } from "@/deps.ts";
import { assertEquals, describe, it } from "@/dev_deps.ts";
import { SliceStatInterface } from "@/shared/apdf/interfaces/PolicySliceStatInterface.ts";
import { BuildExcel } from "./BuildExcel.ts";
import { SlicesWorksheetWriter } from "./SlicesWorksheetWriter.ts";

// Leaks on zlib
describe.skip("SlicesWorksheetWriter", () => {
  it("SlicesWorkbookWriter: should map slice into a dedicated worksheet", async () => {
    const FILEPATH = "/tmp/stream-data-test.xlsx";
    const slicesWorksheetWriter = new SlicesWorksheetWriter();
    const slice0 = {
      slice: { start: 0, end: 2000 },
      count: 2500,
      sum: 154588,
      subsidized: 2400,
    };

    const slice1 = {
      slice: { start: 2000, end: 30000 },
      count: 3000,
      sum: 204598,
      subsidized: 2500,
    };

    const slice2 = {
      slice: { start: 30000 },
      count: 5000,
      sum: 304456,
      subsidized: 4000,
    };
    // Arrange
    const slices: Array<SliceStatInterface> = [
      slice0,
      slice1,
      slice2,
    ];

    // Act
    const workbookWriter: excel.stream.xlsx.WorkbookWriter = BuildExcel
      .initWorkbookWriter(FILEPATH!);
    await slicesWorksheetWriter!.call(workbookWriter, slices);
    await workbookWriter.commit();

    // Assert
    const workbook: excel.Workbook = await new excel.Workbook().xlsx.readFile(
      FILEPATH!,
    );
    const worksheet = workbook.getWorksheet(
      slicesWorksheetWriter!.WORKSHEET_NAME,
    );

    // Header 'normale'
    assertEquals(
      worksheet?.getCell("A1").value,
      slicesWorksheetWriter!.COLUMN_HEADERS_NORMAL[0],
    );
    assertEquals(
      worksheet?.getCell("B1").value,
      slicesWorksheetWriter!.COLUMN_HEADERS_NORMAL[1],
    );
    assertEquals(
      worksheet?.getCell("C1").value,
      slicesWorksheetWriter!.COLUMN_HEADERS_NORMAL[2],
    );
    assertEquals(
      worksheet?.getCell("D1").value,
      slicesWorksheetWriter!.COLUMN_HEADERS_NORMAL[3],
    );

    // Data
    assertEquals(
      worksheet?.getCell("A2").value,
      `Jusqu'à ${slice0.slice.end / 1000} km`,
    );
    assertEquals(worksheet?.getCell("B2").value, {
      formula:
        'SUMIFS(Trajets!R:R,Trajets!S:S,"normale",Trajets!M:M,">=0",Trajets!M:M,"<2000")',
    });
    assertEquals(worksheet?.getCell("C2").value, {
      formula:
        'COUNTIFS(Trajets!S:S,"normale",Trajets!M:M,">=0",Trajets!M:M,"<2000")',
    });
    assertEquals(worksheet?.getCell("D2").value, {
      formula:
        'COUNTIFS(Trajets!R:R,">0",Trajets!S:S,"normale",Trajets!M:M,">=0",Trajets!M:M,"<2000")',
    });

    assertEquals(
      worksheet?.getCell("A3").value,
      `De ${slices[1].slice.start / 1000} km à ${slice1.slice.end / 1000} km`,
    );
    assertEquals(worksheet?.getCell("B3").value, {
      formula:
        'SUMIFS(Trajets!R:R,Trajets!S:S,"normale",Trajets!M:M,">=2000",Trajets!M:M,"<30000")',
    });
    assertEquals(worksheet?.getCell("C3").value, {
      formula:
        'COUNTIFS(Trajets!S:S,"normale",Trajets!M:M,">=2000",Trajets!M:M,"<30000")',
    });
    assertEquals(worksheet?.getCell("D3").value, {
      formula:
        'COUNTIFS(Trajets!R:R,">0",Trajets!S:S,"normale",Trajets!M:M,">=2000",Trajets!M:M,"<30000")',
    });

    assertEquals(
      worksheet?.getCell("A4").value,
      `Supérieure à ${slices[2].slice.start / 1000} km`,
    );
    assertEquals(worksheet?.getCell("B4").value, {
      formula:
        'SUMIFS(Trajets!R:R,Trajets!S:S,"normale",Trajets!M:M,">=30000")',
    });
    assertEquals(worksheet?.getCell("C4").value, {
      formula: 'COUNTIFS(Trajets!S:S,"normale",Trajets!M:M,">=30000")',
    });
    assertEquals(worksheet?.getCell("D4").value, {
      formula:
        'COUNTIFS(Trajets!R:R,">0",Trajets!S:S,"normale",Trajets!M:M,">=30000")',
    });
  });
});
