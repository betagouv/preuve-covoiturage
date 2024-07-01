import { ContextType } from "@/ilos/common/index.ts";
import { ExportParams } from "./ExportParams.ts";

export enum ExportStatus {
  PENDING = "pending",
  RUNNING = "running",
  UPLOADING = "uploading",
  UPLOADED = "uploaded",
  NOTIFY = "notify",
  SUCCESS = "success",
  FAILURE = "failure",
}
export enum ExportTarget {
  OPENDATA = "opendata",
  OPERATOR = "operator",
  TERRITORY = "territory",
}

export type ExportError = string;
export type ExportStats = string;

export class Export {
  public _id: number;
  public uuid: string;
  public target: ExportTarget;
  public status: ExportStatus;
  public progress: number;
  public created_by: number;
  public download_url_expire_at: Date;
  public download_url: string;
  public params: ExportParams;
  public error: ExportError; // JSON object
  public stats: ExportStats; // JSON object

  public static fromJSON(data: any): Export {
    const export_ = new Export();
    export_._id = data._id;
    export_.uuid = data.uuid;
    export_.target = data.target;
    export_.status = data.status;
    export_.progress = data.progress;
    export_.created_by = data.created_by;
    export_.download_url_expire_at = data.download_url_expire_at;
    export_.download_url = data.download_url;
    export_.params = new ExportParams(data.params);
    export_.error = data.error;
    export_.stats = data.stats;
    return export_;
  }

  public static toJSON(export_: Export): any {
    return {
      _id: export_._id,
      uuid: export_.uuid,
      target: export_.target,
      status: export_.status,
      progress: export_.progress,
      created_by: export_.created_by,
      download_url_expire_at: export_.download_url_expire_at,
      download_url: export_.download_url,
      params: ExportParams.toJSON(export_.params),
      error: export_.error,
      stats: export_.stats,
    };
  }

  public static target(
    context: ContextType,
    target: ExportTarget | null = null,
  ): ExportTarget {
    if (target) return target;

    const { operator_id, territory_id } = context.call?.user || {};
    if (parseInt(operator_id) > 0) return ExportTarget.OPERATOR;
    if (parseInt(territory_id) > 0) return ExportTarget.TERRITORY;

    return ExportTarget.OPENDATA;
  }
}
