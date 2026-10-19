import { provider } from "@/ilos/common/index.ts";
import { taggedLogger } from "@/lib/logger/tagged.ts";
import { ExportLogEvent } from "../models/ExportLog.ts";
import { LogRepositoryInterfaceResolver } from "../repositories/LogRepository.ts";

const log = taggedLogger("[export]");

export enum LogLevels {
  INFO = "info",
  ERROR = "error",
  WARNING = "warning",
  DEBUG = "debug",
}

export abstract class LogServiceInterfaceResolver {
  public async created(
    export_id: number,
    message = "Export created",
  ): Promise<void> {
    throw new Error("Not implemented");
  }
  public async cancelled(
    export_id: number,
    message = "Export cancelled",
  ): Promise<void> {
    throw new Error("Not implemented");
  }
  public async running(
    export_id: number,
    message = "Export processing",
  ): Promise<void> {
    throw new Error("Not implemented");
  }
  public async success(
    export_id: number,
    message = "Export succeded",
  ): Promise<void> {
    throw new Error("Not implemented");
  }
  public async failure(
    export_id: number,
    message = "Export failed",
  ): Promise<void> {
    throw new Error("Not implemented");
  }
  public async send(
    export_id: number,
    message = "Export sent by email",
  ): Promise<void> {
    throw new Error("Not implemented");
  }
  public async upload(
    export_id: number,
    message = "Export uploaded",
  ): Promise<void> {
    throw new Error("Not implemented");
  }
}

@provider({
  identifier: LogServiceInterfaceResolver,
})
export class LogService {
  constructor(protected logRepository: LogRepositoryInterfaceResolver) {}

  public async created(
    export_id: number,
    message = "Export created",
  ): Promise<void> {
    log.info("created", { export_id });
    await this.log(export_id, ExportLogEvent.CREATED, message);
  }

  public async cancelled(
    export_id: number,
    message = "Export cancelled",
  ): Promise<void> {
    log.info("cancelled", { export_id });
    await this.log(export_id, ExportLogEvent.CANCELLED, message);
  }

  public async running(
    export_id: number,
    message = "Export being processed",
  ): Promise<void> {
    log.info("being processed", { export_id });
    await this.log(export_id, ExportLogEvent.RUNNING, message);
  }

  public async success(
    export_id: number,
    message = "Export succeeded",
  ): Promise<void> {
    log.info("succeeded", { export_id });
    await this.log(export_id, ExportLogEvent.SUCCESS, message);
  }

  public async failure(
    export_id: number,
    message = "Export failed",
  ): Promise<void> {
    log.error("failed", { export_id });
    await this.log(export_id, ExportLogEvent.FAILURE, message);
  }

  public async send(
    export_id: number,
    message = "Export sent by email",
  ): Promise<void> {
    log.info("sent by email", { export_id });
    await this.log(export_id, ExportLogEvent.SEND, message);
  }

  public async upload(
    export_id: number,
    message = "Export uploaded",
  ): Promise<void> {
    log.info("uploaded", { export_id });
    await this.log(export_id, ExportLogEvent.UPLOAD, message);
  }

  protected async log(
    export_id: number,
    type: ExportLogEvent,
    message: string,
  ): Promise<void> {
    await this.logRepository.add(export_id, type, message);
  }
}
