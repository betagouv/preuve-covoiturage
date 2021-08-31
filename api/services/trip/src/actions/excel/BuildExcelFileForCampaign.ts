import { provider } from '@ilos/common';
import { Workbook } from 'exceljs';
import { ExcelWorkbookHandler } from './ExcelWorkbookHandler';
import { StreamDataToWorkBookSheet } from './StreamDataToWorkBookSheet';

@provider()
export class BuildExcelFileForCampaign {
  constructor(
    private excelWorkbookHandler: ExcelWorkbookHandler,
    private streamDataToWorkBookSheet: StreamDataToWorkBookSheet,
  ) {}

  async call(campaign_id: number, start_date: Date, end_date: Date, campaign_name: string): Promise<string> {
    const templateWorkbook: Workbook = await this.excelWorkbookHandler.loadWorkbookTemplate();
    const processedWorkbook: Workbook = await this.streamDataToWorkBookSheet.call(
      campaign_id,
      templateWorkbook,
      start_date,
      end_date,
    );
    return await this.excelWorkbookHandler.writeWorkbookToTempFile(processedWorkbook, campaign_name);
  }
}
