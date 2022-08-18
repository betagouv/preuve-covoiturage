import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule } from '@angular/material/table';
import { of } from 'rxjs';
import { CapitalcallApiService } from '../../services/capitalcall-api.service';

import { CampaignCapitalcallComponent } from './campaign-capitalcall.component';

fdescribe('CampaignCapitalcallComponent', () => {
  let component: CampaignCapitalcallComponent;
  let fixture: ComponentFixture<CampaignCapitalcallComponent>;
  const capitalCallServiceSpy = jasmine.createSpyObj('CapitalcallApiService', ['list', 'download']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CampaignCapitalcallComponent],
      imports: [HttpClientTestingModule, MatTableModule],
      providers: [{ provide: CapitalcallApiService, useValue: capitalCallServiceSpy }],
    }).compileComponents();
  });

  const createComponent = () => {
    fixture = TestBed.createComponent(CampaignCapitalcallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  };

  it('should create', () => {
    // Arrange
    capitalCallServiceSpy.list.and.returnValue(of([]));

    // Act
    createComponent();

    // Assert
    expect(component).toBeTruthy();
  });

  it('should show empty view', () => {
    // Arrange
    capitalCallServiceSpy.list.and.returnValue(of([]));

    // Act
    createComponent();

    // Assert
    const p = fixture.nativeElement.querySelector('.campaign-capitalcall-empty');
    expect(p.textContent).toContain('Aucun appel fond');
  });

  it('should show table view with 2 elements', () => {
    // Arrange
    capitalCallServiceSpy.list.and.returnValue(
      of([{ Key: 'apdf-3-329-idfm___p-sept-efff38.xlsx' }, { Key: 'apdf-4-329-idfm___p-octo-ee49c1.xlsx' }]),
    );

    // Act
    createComponent();

    // Assert
    const tableRows = fixture.nativeElement.querySelectorAll('tr');
    expect(tableRows.length).toBe(3);

    // Header row
    const headerRow = tableRows[0];
    expect(headerRow.cells[0].textContent).toBe('Mois');
    expect(headerRow.cells[1].textContent).toBe('Action');

    // Data rows
    expect(tableRows[1].cells[0].textContent).toBe('Septembre');
    expect(tableRows[1].cells[1].textContent).toBe('cloud_download');
    expect(tableRows[2].cells[0].textContent).toBe('Octobre');
    expect(tableRows[2].cells[1].textContent).toBe('cloud_download');
  });

  it('should show table view and download on click', () => {
    // Arrange
    capitalCallServiceSpy.list.and.returnValue(
      of([{ Key: 'apdf-3-329-idfm___p-sept-efff38.xlsx' }, { Key: 'apdf-4-329-idfm___p-octo-ee49c1.xlsx' }]),
    );

    // Act
    createComponent();
    fixture.componentInstance.download('apdf-3-329-idfm___p-sept-efff38.xlsx');

    // Assert
    expect(capitalCallServiceSpy.download).toHaveBeenCalled();
  });
});
