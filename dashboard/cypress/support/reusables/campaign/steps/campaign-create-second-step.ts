export function campaignSecondStepSelectDays(): void {
  it('selects days', () => {
    // click DATE select
    cy.get('.RulesForm-date mat-form-field').click();

    // select monday
    cy.get('.mat-select-panel mat-option:first-child').click();

    // focus out of material select
    cy.get('.cdk-overlay-backdrop').click({ force: true });
  });
}
export function campaignSecondStepSelectTimeRange(min, max): void {
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

export function campaignSecondStepAddSecondTimeRange(min, max): void {
  it('add second time range', () => {
    // click add time button
    cy.get('.RulesForm-date div:nth-child(2) > button').click();

    cy.get(
      // eslint-disable-next-line
      '.RulesForm-date div:nth-child(2) .RulesForm-date-time:nth-child(2) app-range-time-picker mat-form-field:nth-child(1) input',
    ).type(`${min}:00`);
    cy.get(
      // eslint-disable-next-line
      '.RulesForm-date div:nth-child(2) .RulesForm-date-time:nth-child(2) app-range-time-picker mat-form-field:nth-child(2) input',
    ).type(`${max}:00`);
  });
}

export function campaignSecondStepSelectRange(): void {
  it('selects range', () => {
    // open RANGE extension
    cy.get('.RulesForm .mat-expansion-panel:nth-child(2)').click();

    // select min range
    cy.get('.RulesForm .noUi-origin:nth-child(2) .noUi-touch-area')
      .trigger('mousedown', { which: 1, clientX: 100, clientY: 600 })
      .trigger('mousemove', { which: 1, clientX: 110, clientY: 600 })
      .trigger('mouseup');

    // value should by 85
  });
}

export function campaignSecondStepSelectRanks(): void {
  it('selects ranks', () => {
    cy.wait(200);
    // open RANKS extension
    cy.get('.RulesForm .mat-expansion-panel:nth-child(4)').click();

    cy.get('.RulesForm-ranks mat-form-field').click();

    // unselect rank B
    cy.get('.mat-select-panel mat-option:nth-child(2)').click();

    // focus out of material select
    cy.get('.cdk-overlay-backdrop').click({ force: true });
  });
}

export function campaignSecondStepSelectTargets(passenger, driver): void {
  it('selects targets: passenger & driver', () => {
    // open TARGET extension
    cy.get('.RulesForm .mat-expansion-panel:nth-child(5)').click();

    if (driver) {
      // click for driver checkbox
      cy.wait(200);
      cy.get('.RulesForm .RulesForm-target-forDriver .mat-checkbox-layout').click({ force: true });
    }

    if (passenger) {
      // click for passenger checkbox
      cy.wait(200);
      cy.get('.RulesForm .RulesForm-target-forPassenger .mat-checkbox-layout').click({ force: true });
    }
  });
}

export function campaignSecondStepSelectOperators(): void {
  it('selects operators', () => {
    // open OPERATORS extension
    cy.get('.RulesForm .mat-expansion-panel:nth-child(6)').click();
    cy.wait(200);
    cy.get('.RulesForm-operators  .mat-checkbox-layout').click({ force: true });
    cy.wait(200);

    cy.get('.RulesForm-operators mat-form-field').click();

    // select first operator
    cy.get('.mat-autocomplete-panel mat-option:first-child').click();
  });
}

export function campaignSecondStepClickNextStep(): void {
  it('clicks on next step to go to step 3', () => {
    cy.get('.mat-horizontal-stepper-content:nth-child(2)  .CampaignForm-content-actions button:nth-child(2)').click();
  });
}

export function campaignSecondStepCheckDisabledNextStep(): void {
  it('check step 3 button is disabled', () => {
    cy.get('.mat-horizontal-stepper-content:nth-child(2)  .CampaignForm-content-actions button:nth-child(2)').should(
      'be.disabled',
    );
  });
}

export function campaignSecondeStepAddInseeFilter(filterType: 'blackList' | 'whiteList'): void {
  it(`selects insee filters extension: ${filterType}`, () => {
    cy.get('.RulesForm .mat-expansion-panel:nth-child(3)').click();

    const child = filterType === 'blackList' ? 1 : 2;
    cy.get(`.RulesForm-insee .mat-tab-label:nth-child(${child})`);

    cy.get('button.inseeFilter-newElement').click();

    // START
    cy.get('.inseeFilter-list:first-child .inseeFilterStartEnd > div:first-child input').type('lyo');
    cy.get('.mat-autocomplete-panel mat-option:first-child').click();

    // END
    cy.get('.inseeFilter-list:first-child .inseeFilterStartEnd > div:nth-child(2) input').type('marseil');
    cy.get('.mat-autocomplete-panel mat-option:first-child').click();

    cy.get('button.inseeFilter-addElement').click();

    cy.get('button.inseeFilter-newElement').click();

    // START
    cy.get('.inseeFilter-list:nth-child(2) .inseeFilterStartEnd > div:first-child input').type('paris');
    cy.get('.mat-autocomplete-panel mat-option:first-child').click();

    // END
    cy.get('.inseeFilter-list:nth-child(2) .inseeFilterStartEnd > div:nth-child(2) input').type('massy');
    cy.get('.mat-autocomplete-panel mat-option:first-child').click();

    cy.get('button.inseeFilter-addElement').click();
  });
}
