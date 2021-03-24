import { ImporterStreamHandlerInterface } from './ImporterStreamHandlerInterface';

export interface GeoImporterInterface {
  process(handler: ImporterStreamHandlerInterface[], file?: string): Promise<void>;
}

export abstract class GeoImporterInterfaceResolver implements GeoImporterInterface {
  abstract process(handler: ImporterStreamHandlerInterface[], file?: string): Promise<void>;
}
