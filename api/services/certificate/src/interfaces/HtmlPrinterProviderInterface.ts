export interface HtmlPrinterProviderInterface {
  png(uuid: string): Promise<Buffer>;
  pdf(uuid: string): Promise<Buffer>;
}

export abstract class HtmlPrinterProviderInterfaceResolver implements HtmlPrinterProviderInterface {
  async png(uuid: string): Promise<Buffer> {
    throw new Error('Method not implemented.');
  }
  async pdf(uuid: string): Promise<Buffer> {
    throw new Error('Method not implemented.');
  }
}
