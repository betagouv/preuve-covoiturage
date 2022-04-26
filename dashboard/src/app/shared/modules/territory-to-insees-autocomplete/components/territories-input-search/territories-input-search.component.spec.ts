import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';
import { SingleResultInterface } from '../../../../../../../../shared/territory/listGeo.contract';
import { TerritoryApiService } from '../../../../../modules/territory/services/territory-api.service';
import { TerritoriesInputSearchComponent } from './territories-input-search.component';

const paris10: SingleResultInterface = {
  _id: 1,
  name: 'Paris 10ème (75)',
  insee: '9333',
};

const damparis: SingleResultInterface = {
  _id: 2,
  name: 'Damparis (39)',
  insee: '9333',
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

describe('app-territories-input-search', () => {
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

  it('should create component and select territory', async () => {
    // Arrange
    const fixture = TestBed.createComponent(TerritoriesInputSearchComponent);
    fixture.componentInstance.parentForm = new FormGroup({ district: new FormControl(), parent: new FormControl() });
    fixture.detectChanges();

    // Assert : component loaded
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.territoryInseeInputCtrl.value).toEqual(null);

    // Act : add paris10 element
    const mockEventParis: any = { option: { value: paris10 } };
    fixture.componentInstance.onTerritoryInseeSelect(mockEventParis);

    // Assert value
    expect(fixture.componentInstance.territoryInseeInputCtrl.value).toEqual(paris10.name);
  });
});
