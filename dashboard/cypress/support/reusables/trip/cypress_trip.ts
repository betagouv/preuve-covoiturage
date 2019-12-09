import {
  expectedExportFilter,
  filterEndMoment,
  filterStartMoment,
} from '../../expectedApiPayload/expectedExportFilter';
import { closeNotification } from '../notification.cypress';

export function cypress_export(e2e = false) {
  it('clicks on trip section', () => {
    cy.get('.Header-menu .Header-menu-item.trip-menu-item').click();
  });
  it('clicks export tab', () => {
    cy.get('.TripLayout .mat-tab-link-container .mat-tab-links a:nth-child(3)').click();
  });

  // todo: check that dates should be now and 1 month before

  it('chooses dates', () => {
    cy.get('.exportFilter mat-form-field:first-child input')
      .clear()
      .type(filterStartMoment.format('DD/MM/YYYY'));
    cy.get('.exportFilter mat-form-field:nth-child(2) input')
      .clear()
      .type(filterEndMoment.format('DD/MM/YYYY'));
  });

  it('clicks export button', () => {
    cy.get('.exportFilter-footer button').click();
    if (!e2e) {
      cy.wait('@tripExport').then((xhr) => {
        const params = xhr.request.body[0].params;
        const method = xhr.request.body[0].method;

        expect(method).equal('trip:export');

        expect(params).eql(expectedExportFilter);
      });
    }
  });

  closeNotification();
}
