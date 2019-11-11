export interface CertificatePrinterProviderInterface {
  png(): Promise<void>;
  pdf(): Promise<void>;
}

export abstract class CertificatePrinterProviderInterfaceResolver implements CertificatePrinterProviderInterface {
  async png(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async pdf(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
