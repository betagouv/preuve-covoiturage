export interface CertificateGeneratorProviderInterface {
  png(): Promise<void>;
  pdf(): Promise<void>;
}

export abstract class CertificateGeneratorProviderInterfaceResolver implements CertificateGeneratorProviderInterface {
  async png(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async pdf(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
