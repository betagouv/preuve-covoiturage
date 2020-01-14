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
    const url =
      'http://localhost:8080/certificates/generate/' +
      '?operator_user_id=c37b7a3a-4a93-4b05-8751-d502efd2d245&start_at=2019-01-01&end_at=2019-12-21';
    console.log({ url });
    await page.goto(url);
    await page.screenshot({ path: 'example.png', fullPage: true });

    // TODO catch errors and log
    // Do not generate image/pdf on errors

    await browser.close();
  }

  async pdf(): Promise<void> {}
}
