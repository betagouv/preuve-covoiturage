import { PrintTypes, PrintOptions } from '.';

export interface PrinterProviderInterface {
  print(url: string, type: PrintTypes, name: string, options?: PrintOptions);
}

export abstract class PrinterProviderInterfaceResolver implements PrinterProviderInterface {
  async print(
    url: string,
    type: PrintTypes,
    name: string,
    options?: PrintOptions,
  ): Promise<{
    headers: { [k: string]: string };
    body: Buffer;
  }> {
    throw new Error('Method not implemented.');
  }
}
