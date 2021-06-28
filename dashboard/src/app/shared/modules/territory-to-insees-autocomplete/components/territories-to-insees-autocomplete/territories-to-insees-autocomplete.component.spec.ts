import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';
import { TerritoryListFilter } from '../../../../../../../../shared/territory/common/interfaces/TerritoryQueryInterface';
import { InseeAndTerritoryInterface } from '../../../../../core/entities/campaign/ux-format/incentive-filters';
import { TerritoryApiService } from '../../../../../modules/territory/services/territory-api.service';
import { TerritoriesToInseesAutocompleteComponent } from './territories-to-insees-autocomplete.component';

const paris10: InseeAndTerritoryInterface = {
  territory_literal: 'Paris 10ème (75)',
  context: 'Paris 10ème (75)',
  insees: ['9333'],
};

const damparis: InseeAndTerritoryInterface = {
  territory_literal: 'Damparis (39)',
  context: 'Damparis (39)',
  insees: ['9333'],
};

class TerritoryApiServiceStub {
  public getList(params: TerritoryListFilter): Observable<any> {
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

describe('app-territories-insee-autocomplete', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TerritoriesToInseesAutocompleteComponent],
      imports: [
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatChipsModule,
        MatFormFieldModule,
        BrowserAnimationsModule,
      ],
      providers: [{ provide: TerritoryApiService, useClass: TerritoryApiServiceStub }],
    }).compileComponents(),
  );

  it("should create component and have 2 mat options with 'pa' input", async () => {
    // Arrange
    const fixture = TestBed.createComponent(TerritoriesToInseesAutocompleteComponent);
    fixture.componentInstance.parentForm = new FormGroup({ start: new FormControl() });
    fixture.componentInstance.fieldName = 'start';
    fixture.detectChanges();
    let input = fixture.debugElement.query(By.css('input'));

    // Act : add paris10 element
    const mockEventParis: any = { option: { value: paris10 } };
    fixture.componentInstance.onTerritoryInseeSelect(mockEventParis);

    // Assert
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.territoryInseesControl.value).toEqual([paris10]);

    // Act : Type 'pa' in input
    input.nativeElement.dispatchEvent(new Event('focusin'));
    input.nativeElement.value = 'pa';
    input.nativeElement.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert
    const matOptions = document.querySelectorAll('mat-option');
    expect(matOptions.length).toBe(2, 'Expect to have 2 mat options');
    expect(fixture.componentInstance.searchedTerritoryInsees.length).toBe(2);

    // Act : add damparis element
    const mockEventDamparis: any = { option: { value: damparis } };
    fixture.componentInstance.onTerritoryInseeSelect(mockEventDamparis);

    // Assert
    expect(fixture.componentInstance.territoryInseesControl.value).toEqual([paris10, damparis]);
    expect(fixture.componentInstance.territoryInseeInputCtrl.value).toEqual(null);
    fixture.detectChanges();
    const matChips = document.querySelectorAll('mat-chip');
    expect(matChips.length).toBe(2, 'Expect to have 2 chip items');
  });

  it("should create component and have 0 mat option with 'hel' input", async () => {
    // Arrange
    const fixture = TestBed.createComponent(TerritoriesToInseesAutocompleteComponent);
    fixture.componentInstance.parentForm = new FormGroup({ end: new FormControl() });
    fixture.componentInstance.fieldName = 'end';
    fixture.detectChanges();

    // Act
    let input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.dispatchEvent(new Event('focusin'));
    input.nativeElement.value = 'unknwon';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert
    expect(input.nativeElement.value).toContain('unknwon');
    const matOptions = document.querySelectorAll('mat-option');
    expect(matOptions.length).toBe(0, 'Expect to have 0 option');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
