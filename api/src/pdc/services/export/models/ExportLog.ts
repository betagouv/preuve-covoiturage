export enum ExportLogEvent {
  CREATED = "created",
  CANCELLED = "cancelled",
  RUNNING = "running",
  SUCCESS = "success",
  FAILURE = "failure",
  SEND = "send",
  UPLOAD = "upload",
}

export class ExportLog {
  public id: number;
  public export_id: number;
  public type: ExportLogEvent;
  public message: string;
  public created_at: Date;

  public static fromJSON(data: any): ExportLog {
    const log = new ExportLog();
    log.id = data.id;
    log.export_id = data.export_id;
    log.type = data.type;
    log.message = data.message;
    log.created_at = data.created_at;
    return log;
  }

  public static toJSON(log: ExportLog): any {
    return {
      id: log.id,
      export_id: log.export_id,
      type: log.type,
      message: log.message,
      created_at: log.created_at,
    };
  }
}
