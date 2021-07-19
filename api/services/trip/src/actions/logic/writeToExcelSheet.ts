import { FlattenTripInterface } from '../BuildExportAction'
import { ExportTripInterface } from '../../interfaces/ExportTripInterface'
import { Workbook, Worksheet } from 'exceljs';
import { normalize } from '../../helpers/normalizeExportDataHelper';

export function writeToExcelSheet(wb: Workbook, trips: ExportTripInterface[]): Workbook {
  const worsheetData: Worksheet = wb.getWorksheet('data');
  // console.info(wb.getWorksheet('data').getTable('Données'))
  trips.forEach(t => {
    const normalizedTrip: FlattenTripInterface = normalize(t, 'Europe/Paris');
    worsheetData.addRow(normalizedTrip)
    // worsheetData.getTable('Données').addRow(Object.values(normalizedTrip))
  });

  // worsheetData.getTable('Données').commit();
  return wb;
}