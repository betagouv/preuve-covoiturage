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
    const url = 'http://localhost:8080/certificates/template/certificate.html';
    console.log({ url });
    await page.goto(url);
    await page.screenshot({ path: 'example.png', fullPage: true });

    await browser.close();
  }

  async pdf(): Promise<void> {}
}
