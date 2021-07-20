import { provider } from '@ilos/common';
import { Workbook } from 'exceljs';
import { ExcelWorkbookHandler } from './ExcelWorkbookHandler';
import { StreamDataToWorkBookSheet } from './StreamDataToWorkBookSheet';

@provider()
export class BuildExcelFileForCampaign {

  constructor(
    private excelWorkbookHandler: ExcelWorkbookHandler,
    private streamDataToWorkBookSheet: StreamDataToWorkBookSheet) {
  }

  async call(campaign_id: number): Promise<string> {
    const templateWorkbook: Workbook = await this.excelWorkbookHandler.loadWorkbookTemplate();
    const processedWorkbook: Workbook = await this.streamDataToWorkBookSheet.call(campaign_id, templateWorkbook)
    return await this.excelWorkbookHandler.writeWorkbookToTempFile(processedWorkbook);
  }
}