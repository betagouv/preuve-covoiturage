import { path } from "@/deps.ts";
import { provider } from "@/ilos/common/Decorators.ts";
import { ProviderInterface } from "@/ilos/common/index.ts";
import { getTmpDir } from "@/lib/file/index.ts";
import { toTzString } from "@/pdc/helpers/dates.helper.ts";
import { sanitize } from "@/pdc/helpers/string.helper.ts";

export interface APDFNameParamsInterface {
  name: string;
  datetime: Date;
  campaign_id: number;
  operator_id: number;
  trips: number;
  subsidized: number;
  amount: number;
}

export type APDFNameResultsInterface = string;

@provider()
export class APDFNameProvider implements ProviderInterface {
  private prefix = "APDF";
  private ext = "xlsx";

  public filename(params: APDFNameParamsInterface): APDFNameResultsInterface {
    const {
      name,
      datetime,
      campaign_id,
      operator_id,
      trips,
      subsidized,
      amount,
    } = params;

    // APDF-2022-01-123-456-campaign-operator-hash.ext
    // 123: campaign_id
    // 456: operator_id
    const filename: string = [
      this.prefix,
      toTzString(datetime, "Europe/Paris").substring(0, 7),
      campaign_id,
      operator_id,
      trips || 0,
      subsidized || 0,
      amount || 0,
      sanitize(name, 128),
    ]
      .filter((s: string | number) =>
        ["string", "number"].indexOf(typeof s) > -1 && String(s).length
      )
      .join("-");

    return `${filename}.${this.ext}`;
  }

  public filepath(
    params: string | APDFNameParamsInterface,
  ): APDFNameResultsInterface {
    const filename = typeof params === "string"
      ? params
      : this.filename(params);
    return path.join(getTmpDir(), filename);
  }

  public parse(str: APDFNameResultsInterface): APDFNameParamsInterface {
    // Extract parts by removing prefix and extension, then split by hyphen
    const parts = (str.split("/").pop() || "")
      .replace(`${this.prefix}-`, "")
      .replace(`.${this.ext}`, "")
      .split("-");

    return {
      name: parts.pop() || "",
      datetime: new Date(`${parts[0]}-${parts[1]}-01T00:00:00Z`),
      campaign_id: parseInt(parts[2], 10),
      operator_id: parseInt(parts[3], 10),
      trips: parseInt(parts[4], 10),
      subsidized: parseInt(parts[5], 10),
      amount: parseInt(parts[6], 10),
    };
  }
}
