export function campaignSecondStepSelectDays(checkAllSelectedDays = false, days: number[] = []): void {
  it('selects days', () => {
    // click DATE select
    cy.get('.RulesForm-date mat-form-field').click();

    if (checkAllSelectedDays) {
      cy.get('.mat-select-panel .mat-option.mat-selected').should('have.length', 7);
    }

    // select monday

    days.forEach((dayInd) =>
      cy.get(`.mat-select-panel-wrap > .mat-select-panel .mat-option:nth-child(${(dayInd + 1).toString()}) `).click(),
    );
    //cy.get('.mat-select-panel mat-option:first-child').click();

    // focus out of material select
    cy.wait(200);
    cy.get('.cdk-overlay-backdrop').click({ force: true });
  });
}
export function campaignSecondStepSelectTimeRange(min: string, max: string): void {
  it('add time range', () => {
    cy.get('.RulesForm .mat-expansion-panel:nth-child(1)').click();

    cy.get('.RulesForm-date div:nth-child(2) app-range-time-picker mat-form-field:nth-child(1) input').type(min);
    cy.get('.RulesForm-date div:nth-child(2) app-range-time-picker mat-form-field:nth-child(2) input').type(max);
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

    // change range  [2 ... 84]

    // select min range
    cy.get('.RulesForm .noUi-origin:nth-child(2) .noUi-touch-area')
      .trigger('mousedown', { which: 1, clientX: 100, clientY: 600 })
      .trigger('mousemove', { which: 1, clientX: 110, clientY: 600 })
      .trigger('mouseup');

    cy.get('.RulesForm .noUi-origin:nth-child(3) .noUi-touch-area')
      .trigger('mousedown', { which: 1 })
      .trigger('mousemove', { which: 1, clientX: 500, clientY: 600 })
      .trigger('mouseout');

    // value should by 85
  });
}

export function campaignSecondStepSelectRanks(checkDefaultSelected = false, select: number[] = []): void {
  it('selects ranks', () => {
    cy.wait(200);
    cy.get('.RulesForm .mat-expansion-panel:nth-child(4)').click();
    cy.get('.RulesForm-ranks mat-form-field').click();

    // check that all three classes are selected by default
    if (checkDefaultSelected) {
      cy.get('.mat-select-panel .mat-option.mat-selected').should('have.length', 3);
    }

    // open RANKS extension

    select.forEach((selectedField) =>
      cy.get(`.mat-select-panel mat-option:nth-child(${(selectedField + 1).toString()})`).click(),
    );

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

export function checkAllOperatorSelected(): void {
  it('check all operator selected', () => {
    cy.wait(200);
    cy.get('.RulesForm .mat-expansion-panel:nth-child(6)').click();
    cy.get('.RulesForm-operators input[type=checkbox][aria-checked=true]').should('exist');
  });
}

export function campaignSecondStepSelectOperators(operators: string[] = null): void {
  it('selects operators', () => {
    // open OPERATORS extension
    cy.get('.RulesForm .mat-expansion-panel:nth-child(6)').click();
    cy.get('.RulesForm-operators  .mat-checkbox-layout').click({ force: true });
    cy.wait(200);

    // select first operator if no operators provided
    if (!operators) {
      cy.get('.RulesForm-operators mat-form-field').click();
      cy.get('.mat-autocomplete-panel mat-option:first-child').click();
    } else {
      operators.forEach((operator) => {
        cy.get('.RulesForm-operators mat-form-field').click();
        cy.get('.RulesForm-operators .mat-form-field input').type(operator);
        cy.wait(200);
        cy.get('.mat-autocomplete-panel mat-option:first-child').click();
      });
    }

    // select first operator
    // cy.get('.mat-autocomplete-panel mat-option:first-child').click();
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

export function campaignSecondeStepAddInseeFilter(
  filterType: 'blackList' | 'whiteList',
  checkEmptyWhiteListError = false,
  trips: { startCity: string; endCity: string }[] = [],
): void {
  it(`selects insee filters extension: ${filterType}`, () => {
    cy.get('.RulesForm .mat-expansion-panel:nth-child(3)').click();

    const child = filterType === 'blackList' ? 1 : 2;
    cy.get(`.RulesForm-insee .mat-tab-label:nth-child(${child})`).click({ force: true });

    cy.wait(200);

    if (checkEmptyWhiteListError === true && filterType === 'whiteList') {
      cy.get('.RulesForm-insee .mat-error[role=alert]').contains('Au moins une règle de trajets doit être définie.');
    }

    trips.forEach((trip) => {
      cy.get('button.inseeFilter-newElement').click();

      // START
      cy.get('.inseeFilterStartEnd > div:first-child input').type(trip.startCity);
      cy.get('.mat-autocomplete-panel mat-option:first-child').click();

      // END
      cy.get('.inseeFilterStartEnd > div:nth-child(2) input').type(trip.endCity);
      cy.get('.mat-autocomplete-panel mat-option:first-child').click();

      cy.get('button.inseeFilter-addElement').click();
    });

    if (checkEmptyWhiteListError === true && filterType === 'whiteList') {
      cy.get('.RulesForm-insee .mat-error[role=alert]').should('not.visible');
    }
  });
}
