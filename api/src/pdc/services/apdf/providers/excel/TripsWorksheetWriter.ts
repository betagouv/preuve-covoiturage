import { provider } from "@/ilos/common/index.ts";
import { excel } from "@/deps.ts";
import { normalize } from "../../helpers/normalizeAPDFData.helper.ts";
import { APDFTripInterface } from "../../interfaces/APDFTripInterface.ts";
import { PgCursorHandler } from "@/shared/common/PromisifiedPgCursor.ts";
import { AbstractWorksheetWriter } from "./AbstractWorksheetWriter.ts";

@provider()
export class TripsWorksheetWriter extends AbstractWorksheetWriter {
  public readonly CURSOR_BATCH_SIZE = 100;
  public readonly WORKSHEET_NAME = "Trajets";
  // TODO improve listing of columns
  public readonly WORKSHEET_COLUMN_HEADERS: Partial<excel.Column>[] = [
    "rpc_journey_id",
    "operator_journey_id",
    "operator_trip_id",
    "start_datetime",
    "end_datetime",
    "start_location",
    "start_epci",
    "start_insee",
    "end_location",
    "end_epci",
    "end_insee",
    "duration",
    "distance",
    "operator",
    "operator_class",
    "driver_operator_user_id",
    "passenger_operator_user_id",
    "rpc_incentive",
    "incentive_type",
  ].map((header) => ({ header, key: header }));

  async call(
    cursor: PgCursorHandler<APDFTripInterface>,
    booster_dates: Set<string>,
    workbookWriter: excel.stream.xlsx.WorkbookWriter,
  ): Promise<void> {
    const worksheet: excel.Worksheet = this.initWorkSheet(
      workbookWriter,
      this.WORKSHEET_NAME,
      this.WORKSHEET_COLUMN_HEADERS,
    );

    // style columns and apply optimised width
    const font = { name: "Courier", family: 3, size: 9 };
    const columns = {
      A: { width: 29, font },
      B: { width: 29, font },
      C: { width: 29, font },
      D: { width: 21, font },
      E: { width: 21, font },
      F: { width: 21, font },
      G: { width: 32, font },
      H: { width: 10, font },
      I: { width: 21, font },
      J: { width: 32, font },
      K: { width: 10, font },
      L: { width: 10, font },
      M: { width: 10, font },
      N: { width: 20, font },
      O: { width: 20, font },
      P: { width: 29, font },
      Q: { width: 29, font },
      R: { width: 12, font },
      S: { width: 12, font },
    };

    Object.entries(columns).forEach(([key, value]) => {
      Object.entries(value).forEach(([k, v]) => {
        worksheet.getColumn(key)[k] = v;
      });
    });

    // style the header
    worksheet.getRow(1).font = {
      name: "Courier",
      family: 3,
      bold: true,
      size: 9,
    };

    const b1 = new Date();
    let results: APDFTripInterface[] = await cursor.read(
      this.CURSOR_BATCH_SIZE,
    );
    while (results.length > 0) {
      results.forEach((t) =>
        t &&
        worksheet.addRow(normalize(t, booster_dates, "Europe/Paris")).commit()
      );
      results = await cursor.read(this.CURSOR_BATCH_SIZE);
    }

    const b2 = new Date();
    cursor.release();
    console.debug(
      `[apdf:export] writing trips took: ${
        (b2.getTime() - b1.getTime()) / 1000
      }s`,
    );

    worksheet.commit();
    return;
  }
}
