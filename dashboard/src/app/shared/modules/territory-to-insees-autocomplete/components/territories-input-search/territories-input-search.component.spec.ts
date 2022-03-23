import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';
import { InseeAndTerritoryInterface } from '../../../../../core/entities/campaign/ux-format/incentive-filters';
import { TerritoryApiService } from '../../../../../modules/territory/services/territory-api.service';
import { TerritoriesInputSearchComponent } from './territories-input-search.component';

const paris10: InseeAndTerritoryInterface = {
  territory_literal: 'Paris 10ème (75)',
  context: 'Paris 10ème (75)',
  insees: '9333',
};

const damparis: InseeAndTerritoryInterface = {
  territory_literal: 'Damparis (39)',
  context: 'Damparis (39)',
  insees: '9333',
};

class TerritoryApiServiceStub {
  public geo(params: any): Observable<any> {
    if (params.search.startsWith('pa')) {
      return of({
        data: [damparis, paris10],
      });
    } else if (params.search === 'unknwon') {
      return of({
        data: [],
      });
    }
  }
}

fdescribe('app-territories-input-search', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TerritoriesInputSearchComponent],
      imports: [
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
      ],
      providers: [{ provide: TerritoryApiService, useClass: TerritoryApiServiceStub }],
    }).compileComponents(),
  );

  it('should create component and add input', async () => {
    // Arrange
    const fixture = TestBed.createComponent(TerritoriesInputSearchComponent);
    fixture.componentInstance.parentForm = new FormGroup({ district: new FormControl() });
    fixture.componentInstance.fieldName = 'district';
    fixture.detectChanges();

    // Assert : component loaded
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.territoryInseeInputCtrl.value).toEqual(null);

    // Act : add paris10 element
    const mockEventParis: any = { option: { value: paris10 } };
    fixture.componentInstance.onTerritoryInseeSelect(mockEventParis);

    // Assert value
    expect(fixture.componentInstance.territoryInseeInputCtrl.value).toEqual(paris10);
  });
});
