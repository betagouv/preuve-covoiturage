import puppeteer from 'puppeteer';
import { provider } from '@ilos/common';

import {
  CertificatePrinterProviderInterface,
  CertificatePrinterProviderInterfaceResolver,
} from '../interfaces/CertificatePrinterProviderInterface';

@provider({
  identifier: CertificatePrinterProviderInterfaceResolver,
})
export class CertificatePrinterProvider implements CertificatePrinterProviderInterface {
  async png(): Promise<void> {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const url = 'http://localhost:8080/certificates/render/?identity=+33619660000';
    console.log({ url });

    await page.goto(url);
    await page.screenshot({ path: 'example.png', fullPage: true });

    // TODO catch errors and log
    // Do not render image/pdf on errors

    // TODO return binary payload instead of saving to file

    await browser.close();
  }

  async pdf(): Promise<void> {}
}
