import { CypressExpectedCampaign } from '../../../apiValues/expectedCampaign';

export function campaignSecondStepSelectDays() {
  it('selects days', () => {
    // click DATE select
    cy.get('.RulesForm-date mat-form-field').click();

    // select monday
    cy.get('.mat-select-panel mat-option:first-child').click();

    // focus out of material select
    cy.get('.cdk-overlay-backdrop').click({ force: true });
  });
}
export function campaignSecondStepSelectTimeRange(min, max) {
  it('add time range', () => {
    cy.get('.RulesForm .mat-expansion-panel:nth-child(1)').click();

    cy.get('.RulesForm-date div:nth-child(2) app-range-time-picker mat-form-field:nth-child(1) input').type(
      `0${min}:00`,
    );
    cy.get('.RulesForm-date div:nth-child(2) app-range-time-picker mat-form-field:nth-child(2) input').type(
      `${max}:00`,
    );
  });
}

export function campaignSecondStepAddSecondTimeRange(min, max) {
  it('add second time range', () => {
    // click add time button
    cy.get('.RulesForm-date div:nth-child(2) > button').click();

    cy.get(
      '.RulesForm-date div:nth-child(2) .RulesForm-date-time:nth-child(2) app-range-time-picker mat-form-field:nth-child(1) input',
    ).type(`${min}:00`);
    cy.get(
      '.RulesForm-date div:nth-child(2) .RulesForm-date-time:nth-child(2) app-range-time-picker mat-form-field:nth-child(2) input',
    ).type(`${max}:00`);
  });
}

export function campaignSecondStepSelectRange() {
  it('selects range', () => {
    // open RANGE extension
    cy.get('.RulesForm .mat-expansion-panel:nth-child(2)').click();

    // select min range
    cy.get('.RulesForm .noUi-origin:nth-child(2) .noUi-touch-area')
      .trigger('mousedown', { which: 1, clientX: 100, clientY: 600 })
      .trigger('mousemove', { which: 1, clientX: 500, clientY: 600 })
      .trigger('mouseup');

    // value should by 85
  });
}

export function campaignSecondStepSelectRanks() {
  it('selects ranks', () => {
    // open RANKS extension
    cy.get('.RulesForm .mat-expansion-panel:nth-child(3)').click();

    cy.get('.RulesForm-ranks mat-form-field').click();

    // select rank A
    cy.get('.mat-select-panel mat-option:first-child').click();

    // select rank C
    cy.get('.mat-select-panel mat-option:nth-child(3)').click();

    // focus out of material select
    cy.get('.cdk-overlay-backdrop').click({ force: true });
  });
}

export function campaignSecondStepSelectTargets(passenger, driver) {
  it('selects targets: passenger & driver', () => {
    // open TARGET extension
    cy.get('.RulesForm .mat-expansion-panel:nth-child(4)').click();

    if (driver) {
      // click for driver checkbox
      cy.get('.RulesForm .RulesForm-target-forDriver .mat-checkbox-layout').click();
    }

    if (passenger) {
      // click for passenger checkbox
      cy.get('.RulesForm .RulesForm-target-forPassenger .mat-checkbox-layout').click();
    }
  });
}

export function campaignSecondStepSelectOperators() {
  it('selects operators', () => {
    // open OPERATORS extension
    cy.get('.RulesForm .mat-expansion-panel:nth-child(5)').click();

    cy.get('.RulesForm-operators mat-form-field').click();

    // select first operator
    cy.get('.mat-autocomplete-panel mat-option:first-child').click();
  });
}

export function campaignSecondStepClickNextStep() {
  it('clicks on next step to go to step 3', () => {
    cy.get('.mat-horizontal-stepper-content:nth-child(2)  .CampaignForm-content-actions button:nth-child(2)').click();
  });
}

export function campaignSecondStepCheckDisabledNextStep() {
  it('check step 3 button is disabled', () => {
    cy.get('.mat-horizontal-stepper-content:nth-child(2)  .CampaignForm-content-actions button:nth-child(2)').should(
      'be.disabled',
    );
  });
}
