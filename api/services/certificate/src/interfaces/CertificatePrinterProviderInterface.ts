export interface CertificatePrinterProviderInterface {
  png(identity: string, start_at: Date, end_at: Date): Promise<Buffer>;
  pdf(identity: string, start_at: Date, end_at: Date): Promise<Buffer>;
}

export abstract class CertificatePrinterProviderInterfaceResolver implements CertificatePrinterProviderInterface {
  async png(identity: string, start_at: Date, end_at: Date): Promise<Buffer> {
    throw new Error('Method not implemented.');
  }
  async pdf(identity: string, start_at: Date, end_at: Date): Promise<Buffer> {
    throw new Error('Method not implemented.');
  }
}
