import { ExportFilterInterface } from '~/core/interfaces/filter/exportFilterInterface';

export const filterStartMoment = Cypress.moment()
  .subtract(1, 'months')
  .startOf('day');
export const filterEndMoment = Cypress.moment()
  .subtract(3, 'months')
  .startOf('day');

export const expectedExportFilter: ExportFilterInterface = {
  date: <any>{
    start: filterStartMoment.toDate().toISOString(),
    end: filterEndMoment.toDate().toISOString(),
  },
};
