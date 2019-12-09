import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { DEFAULT_TRIP_LIMIT } from '~/core/const/filter.const';

import { expectedFilter, filterEndMoment, filterStartMoment } from '../../expectedApiPayload/expectedFilter';
import { territoryStub } from '../../stubs/territory/territory.find';
import { operatorStub } from '../../stubs/operator/operator.find';

export function cypress_filter(e2e = false, group: UserGroupEnum) {
  it('clicks on trip section', () => {
    cy.get('.Header-menu .Header-menu-item.trip-menu-item').click();
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
      cy.get('app-campaign-auto-complete input').type('limiter le trafic');
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
    cy.get('.filter-distances mat-form-field:first-child input').type((expectedFilter.distance.min / 1000).toString());
    cy.get('.filter-distances mat-form-field:nth-child(2) input').type((expectedFilter.distance.max / 1000).toString());
  });

  it('searchs & adds towns', () => {
    cy.get('app-territories-insee-autocomplete mat-form-field input').type('lyo');
    cy.get('.mat-autocomplete-panel mat-option:first-child').click();
    cy.get('app-territories-insee-autocomplete mat-form-field input').type('villeurbanne');
    cy.get('.mat-autocomplete-panel mat-option:first-child').click();
  });

  if (group === UserGroupEnum.OPERATOR || group === UserGroupEnum.REGISTRY) {
    it('chooses territories', () => {
      cy.get('app-territories-autocomplete mat-form-field input').type(e2e ? 'a' : territoryStub.name);
      cy.get('.mat-autocomplete-panel mat-option:first-child').click();
    });
  }

  it('chooses ranks: A, B', () => {
    cy.get('.filter-trip-types > mat-form-field:first-child').click();
    cy.get('.mat-select-panel mat-option:first-child').click();
    cy.get('.mat-select-panel mat-option:nth-child(2)').click();
    // focus out of material select
    cy.get('.cdk-overlay-backdrop').click({ force: true });
  });

  it('chooses status: en cours', () => {
    cy.wait(700); // searches is mat-select-panel from ranks
    cy.get('.filter-trip-types mat-form-field:nth-child(2)').click();
    cy.get('.mat-select-panel mat-option:first-child').click();
  });
  if (group === UserGroupEnum.TERRITORY || group === UserGroupEnum.REGISTRY) {
    it('chooses operators', () => {
      if (e2e) {
        cy.get('app-operators-autocomplete mat-form-field input').click();
      } else {
        cy.get('app-operators-autocomplete mat-form-field input').type('opé');
      }
      cy.get('.mat-autocomplete-panel mat-option:first-child').click();
    });
  }

  // to avoid infinite scroll messing things up
  it('scroll-bugfix', () => {
    cy.get('.filter-footer button:first-child').scrollIntoView();
    cy.wait(3000);
  });

  it('click filter button', () => {
    cy.get('.filter-footer button:first-child').click();
    if (!e2e) {
      cy.wait('@tripList').then((xhr) => {
        const params = xhr.request.body[0].params;
        const method = xhr.request.body[0].method;

        expect(method).equal('trip:list');

        const filter = {
          ...expectedFilter,
          skip: 0,
          limit: DEFAULT_TRIP_LIMIT,
        };

        expect(params).eql(filter);
      });
    }
  });

  // go to stat page
  it('clicks stats tab', () => {
    // need a delaye between 2 calls
    cy.get('.TripLayout .mat-tab-link-container .mat-tab-links a:nth-child(1)').click();
    cy.wait(1000);
  });

  if (e2e) {
    // check that their is no trips
    it('checks the data is null', () => {
      cy.wait(1000);
      cy.get('.stats-numbers app-stat-number:nth-child(1) .stat-number-title p').contains('0');
    });
  }

  it('opens filter', () => {
    cy.get('.TripLayout-menu-filter-button').click();
  });

  it('click on reinitialize', () => {
    cy.get('.filter-footer button:nth-child(2)').click();
  });

  it('click filter button', () => {
    cy.get('.filter-footer button:first-child').click();

    if (!e2e) {
      cy.wait('@tripStat').then((xhr) => {
        const params = xhr.request.body[0].params;
        const method = xhr.request.body[0].method;

        expect(method).equal('trip:stats');

        const filter = {};

        if (group === UserGroupEnum.TERRITORY) {
          filter['territory_id'] = [territoryStub._id];
        }

        if (group === UserGroupEnum.OPERATOR) {
          filter['operator_id'] = [operatorStub._id];
        }

        expect(params).eql(filter);
      });
    }
  });
}
