import puppeteer from 'puppeteer';

import { provider, InitHookInterface } from '@ilos/common';

import { PrintOptions, PrintTypes, PrinterProviderInterface, PrinterProviderInterfaceResolver } from './interfaces';

@provider({
  identifier: PrinterProviderInterfaceResolver,
})
export class PrinterProvider implements PrinterProviderInterface, InitHookInterface {
  private page;

  async init(): Promise<void> {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    this.page = await browser.newPage();

    console.log('> Chrome browser ready');
  }

  async print(
    url: string,
    type: PrintTypes,
    name: string,
    options?: PrintOptions,
  ): Promise<{
    headers: { [k: string]: string };
    body: Buffer;
  }> {
    const opts = { ...options };

    if (opts.auth) {
      await this.page.setExtraHTTPHeaders({ authorization: `Bearer ${opts.auth}` });
    }

    await this.page.goto(url);
    console.log(`Printed ${type}: ${url}`);

    switch (type) {
      case 'png':
        return {
          headers: {
            'Content-type': 'image/png',
            'Content-disposition': `attachment; filename=${name}.png`,
          },
          body: await this.page.screenshot({ fullPage: true }),
        };
      default:
        return {
          headers: {
            'Content-type': 'application/pdf',
            'Content-disposition': `attachment; filename=${name}.pdf`,
          },
          body: await this.page.pdf({ format: 'A4', scale: 0.3333 }),
        };
    }
  }
}
