import { provider, ProviderInterface } from "@/ilos/common/index.ts";
import { toTzString } from "@/pdc/helpers/dates.helper.ts";
import { os, path } from "@/deps.ts";

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
      this.sanitize(name),
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
    return path.join(os.tmpdir(), filename);
  }

  public parse(str: APDFNameResultsInterface): APDFNameParamsInterface {
    const parts = str.split("/").pop().replace(`${this.prefix}-`, "").replace(
      `.${this.ext}`,
      "",
    ).split("-");
    const name = parts.pop();

    return {
      name,
      datetime: new Date(`${parts[0]}-${parts[1]}-01T00:00:00Z`),
      campaign_id: parseInt(parts[2], 10),
      operator_id: parseInt(parts[3], 10),
      trips: parseInt(parts[4], 10),
      subsidized: parseInt(parts[5], 10),
      amount: parseInt(parts[6], 10),
    };
  }

  public sanitize(str: string): string {
    return str
      .replace(/\u20AC/g, "e") // € -> e
      .normalize("NFD")
      .replace(/[\ \.\/]/g, "_")
      .replace(/([\u0300-\u036f]|[^\w-_\ ])/g, "")
      .replace("_-_", "-")
      .toLowerCase()
      .substring(0, 128);
  }
}
