import { ExportParams } from './ExportParams';

export enum ExportStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILURE = 'failure',
}
export enum ExportTarget {
  OPENDATA = 'opendata',
  OPERATOR = 'operator',
  TERRITORY = 'territory',
}

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
  public error: string; // JSON object
  public stats: string; // JSON object

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
}
