import { DEFAULT_TRIP_LIMIT, DEFAULT_TRIP_SKIP } from '../../../src/app/core/const/filter.const';

/// <reference types="Cypress" />
import { expectedFilter, filterEndMoment, filterStartMoment } from '../apiValues/expectedFilter';

export function cypress_filterTrips(e2e = false) {
  it('clicks on trip section', () => {
    cy.get('.Header-menu .Header-menu-item:nth-child(2)').click();
  });
  it('clicks list tab', () => {
    cy.get('.TripLayout .mat-tab-link-container .mat-tab-links a:nth-child(2)').click();
  });
  it('opens filter', () => {
    cy.get('.TripLayout-menu-filter-button').click();
  });

  it('chooses campaign', () => {
    cy.get('app-campaign-auto-complete mat-form-field').click();

    cy.get('.mat-autocomplete-panel mat-option:first-child').click();

    if (!e2e) {
      cy.get('app-campaign-auto-complete input').type('limiter');
      cy.get('.mat-autocomplete-panel mat-option:first-child').click();
    }
  });

  it('chooses dates', () => {
    cy.get('.filter-dates mat-form-field:first-child input').type(filterStartMoment.format('DD/MM/YYYY'));
    cy.get('.filter-dates mat-form-field:nth-child(2) input').type(filterEndMoment.format('DD/MM/YYYY'));
  });

  it('chooses hours', () => {
    cy.get('.filter-timeAndDays mat-form-field:first-child input').type(`${expectedFilter.hour.start}:00`);
    cy.get('.filter-timeAndDays mat-form-field:nth-child(2) input').type(`${expectedFilter.hour.end}:00`);
  });

  it('chooses days', () => {
    cy.get('.filter-timeAndDays mat-form-field:nth-child(3)').click();
    cy.get('.mat-select-panel mat-option:first-child').click();
    cy.get('.mat-select-panel mat-option:nth-child(2)').click();

    // focus out of material select
    cy.get('.cdk-overlay-backdrop').click({ force: true });
  });

  it('chooses min & max distance', () => {
    cy.get('.filter-distances mat-form-field:first-child input').type(expectedFilter.distance.min.toString());
    cy.get('.filter-distances mat-form-field:nth-child(2) input').type(expectedFilter.distance.max.toString());
  });

  it('searchs & adds towns', () => {
    cy.get('app-towns-autocomplete mat-form-field input').type('lyo');
    cy.get('.mat-autocomplete-panel mat-option:first-child').click();
  });

  // // todo: if connected as operator or registry
  // it('chooses territories', () => {
  //   cy.get('app-territories-autocomplete mat-form-field input').type('a');
  //   cy.get('.mat-autocomplete-panel mat-option:first-child').click();
  // });

  it('chooses ranks: A, B', () => {
    cy.get('.filter-trip-types > mat-form-field:first-child').click();
    cy.get('.mat-select-panel mat-option:first-child').click();
    cy.get('.mat-select-panel mat-option:nth-child(2)').click();
    // focus out of material select
    cy.get('.cdk-overlay-backdrop').click({ force: true });
  });

  it('chooses status: en cours', () => {
    cy.get('.filter-trip-types mat-form-field:nth-child(2)').click();
    cy.get('.mat-select-panel mat-option:first-child').click();
  });

  // todo: if connected as territory or registry
  // it('chooses operators', () => {
  //   cy.get('app-operators-autocomplete mat-form-field input').type('opé');
  //   cy.get('.mat-autocomplete-panel mat-option:first-child').click();
  // });

  it('click filter button', () => {
    cy.get('.filter-footer button:first-child').click();

    if (!e2e) {
      cy.wait('@tripList').then((xhr) => {
        const params = xhr.request.body[0].params;
        const method = xhr.request.body[0].method;

        expect(method).equal('trip:list');

        const { skip, ...allParamsExceptSkip } = params;

        const filter = {
          ...expectedFilter,
          limit: DEFAULT_TRIP_LIMIT,
        };

        // todo: tmp unit operators connected
        delete filter.operator_id;

        expect(allParamsExceptSkip).eql(filter);
      });
    }
  });
}
