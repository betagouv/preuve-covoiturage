import { ProviderInterface } from '@ilos/common';
import { PdfTemplateData } from './PdfTemplateData';

export interface PdfCertProviderInterface extends ProviderInterface {
  pdf(data: PdfTemplateData): Promise<Buffer>;
}

export abstract class PdfCertProviderInterfaceResolver implements PdfCertProviderInterface {
  async pdf(data: PdfTemplateData): Promise<Buffer> {
    throw new Error('Not implemented');
  }
}
