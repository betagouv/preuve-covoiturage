import { provider } from '@ilos/common';
import { ExportLogEvent } from '../models/ExportLog';
import { LogRepositoryInterfaceResolver } from '../repositories/LogRepository';

export enum LogLevels {
  INFO = 'info',
  ERROR = 'error',
  WARNING = 'warning',
  DEBUG = 'debug',
}

export type LogServiceInterface = {
  created(export_id: number, message?: string): Promise<void>;
  cancelled(export_id: number, message?: string): Promise<void>;
  running(export_id: number, message?: string): Promise<void>;
  success(export_id: number, message?: string): Promise<void>;
  failure(export_id: number, message?: string): Promise<void>;
  send(export_id: number, message?: string): Promise<void>;
  upload(export_id: number, message?: string): Promise<void>;
};

export abstract class LogServiceInterfaceResolver implements LogServiceInterface {
  public async created(export_id: number, message = 'Export created'): Promise<void> {
    throw new Error('Not implemented');
  }
  public async cancelled(export_id: number, message = 'Export cancelled'): Promise<void> {
    throw new Error('Not implemented');
  }
  public async running(export_id: number, message = 'Export processing'): Promise<void> {
    throw new Error('Not implemented');
  }
  public async success(export_id: number, message = 'Export succeded'): Promise<void> {
    throw new Error('Not implemented');
  }
  public async failure(export_id: number, message = 'Export failed'): Promise<void> {
    throw new Error('Not implemented');
  }
  public async send(export_id: number, message = 'Export sent by email'): Promise<void> {
    throw new Error('Not implemented');
  }
  public async upload(export_id: number, message = 'Export uploaded'): Promise<void> {
    throw new Error('Not implemented');
  }
}

@provider({
  identifier: LogServiceInterfaceResolver,
})
export class LogService {
  constructor(protected logRepository: LogRepositoryInterfaceResolver) {}

  public async created(export_id: number, message = 'Export created'): Promise<void> {
    console.info(` ~ Export #${export_id} created`);
    await this.log(export_id, ExportLogEvent.CREATED, message);
  }

  public async cancelled(export_id: number, message = 'Export cancelled'): Promise<void> {
    console.info(` ~ Export #${export_id} cancelled`);
    await this.log(export_id, ExportLogEvent.CANCELLED, message);
  }

  public async running(export_id: number, message = 'Export being processed'): Promise<void> {
    console.info(` ~ Export #${export_id} being processed`);
    await this.log(export_id, ExportLogEvent.RUNNING, message);
  }

  public async success(export_id: number, message = 'Export succeeded'): Promise<void> {
    console.info(` ~ Export #${export_id} succeeded`);
    await this.log(export_id, ExportLogEvent.SUCCESS, message);
  }

  public async failure(export_id: number, message = 'Export failed'): Promise<void> {
    console.error(` ~ Export #${export_id} failed`);
    await this.log(export_id, ExportLogEvent.FAILURE, message);
  }

  public async send(export_id: number, message = 'Export sent by email'): Promise<void> {
    console.info(` ~ Export #${export_id} sent by email`);
    await this.log(export_id, ExportLogEvent.SEND, message);
  }

  public async upload(export_id: number, message = 'Export uploaded'): Promise<void> {
    console.info(` ~ Export #${export_id} uploaded`);
    await this.log(export_id, ExportLogEvent.UPLOAD, message);
  }

  protected async log(export_id: number, type: ExportLogEvent, message: string): Promise<void> {
    await this.logRepository.add(export_id, type, message);
  }
}
