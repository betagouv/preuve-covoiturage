import { filterEndMoment, filterStartMoment } from '../../expectedApiPayload/expectedExportFilter';
import { closeNotification } from '../notification.cypress';

export function cypress_export(e2e = false): void {
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
    cy.wait(500);
    cy.get('.confirm').click();
    if (!e2e) {
      cy.wait('@tripExport').then((xhr) => {
        const method = xhr.request.body[0].method;
        expect(method).equal('trip:export');
      });
    }
  });

  closeNotification();
}
