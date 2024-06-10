import { ProviderInterface } from "@/ilos/common/index.ts";
import { PdfTemplateData } from "./PdfTemplateData.ts";

export interface PdfCertProviderInterface extends ProviderInterface {
  pdf(data: PdfTemplateData): Promise<Buffer>;
}

export abstract class PdfCertProviderInterfaceResolver
  implements PdfCertProviderInterface {
  async pdf(data: PdfTemplateData): Promise<Buffer> {
    throw new Error("Not implemented");
  }
}
