import { ImporterStreamHandlerInterface } from './ImporterStreamHandlerInterface';

export interface GeoImporterInterface {
    process(url: string, handler: ImporterStreamHandlerInterface[]): Promise<void>;
}

export abstract class GeoImporterInterfaceResolver implements GeoImporterInterface {
    abstract process(url: string, handler: ImporterStreamHandlerInterface[]): Promise<void>;
}