import { Operator } from '~/core/entities/operator/operator';
import { S3Object } from './../../../../../../../shared/trip/listCapitalcalls.contract';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule } from '@angular/material/table';
import { of } from 'rxjs';
import { CapitalcallApiService } from '../../services/capitalcall-api.service';

import { CampaignCapitalcallComponent } from './campaign-capitalcall.component';
import { CommonDataService } from '../../../../core/services/common-data.service';

fdescribe('CampaignCapitalcallComponent', () => {
  let component: CampaignCapitalcallComponent;
  let fixture: ComponentFixture<CampaignCapitalcallComponent>;
  const capitalCallServiceSpy = jasmine.createSpyObj('CapitalcallApiService', ['list', 'download']);
  const commonDataServiceSpy = jasmine.createSpyObj('CommonDataService', ['operators$']);

  const s3ObjectList: S3Object[] = [
    { key: 'apdf-3-329-idfm___p-sept-efff38.xlsx', signed_url: 'https://s3-link-1.com' },
    { key: 'apdf-4-329-idfm___p-octo-ee49c1.xlsx', signed_url: 'https://s3-link-2.com' },
  ];

  const operators: Partial<Operator>[] = [
    { _id: 4, name: 'Karos' },
    { _id: 3, name: 'Klaxit' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CampaignCapitalcallComponent],
      imports: [HttpClientTestingModule, MatTableModule],
      providers: [
        { provide: CapitalcallApiService, useValue: capitalCallServiceSpy },
        {
          provide: CommonDataService,
          useValue: commonDataServiceSpy,
        },
      ],
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
    commonDataServiceSpy.operators$ = of([]);

    // Act
    createComponent();

    // Assert
    expect(component).toBeTruthy();
  });

  it('should show empty view', () => {
    // Arrange
    capitalCallServiceSpy.list.and.returnValue(of([]));
    commonDataServiceSpy.operators$ = of(operators);

    // Act
    createComponent();

    // Assert
    const p = fixture.nativeElement.querySelector('.campaign-capitalcall-empty');
    expect(p.textContent).toContain('Aucun appel fond');
  });

  it('should show table view with 2 elements for registry or territory user', () => {
    // Arrange
    capitalCallServiceSpy.list.and.returnValue(of(s3ObjectList));
    console.debug(commonDataServiceSpy.operators$);
    commonDataServiceSpy.operators$ = of(operators);

    // Act
    createComponent();

    // Assert
    const tableRows = fixture.nativeElement.querySelectorAll('tr');
    expect(tableRows.length).toBe(3);

    // Header row
    const headerRow = tableRows[0];
    expect(headerRow.cells[0].textContent).toBe('Mois');
    expect(headerRow.cells[1].textContent).toBe('Opérateur');
    expect(headerRow.cells[2].textContent).toBe('Action');

    // Data rows
    expect(tableRows[1].cells[0].textContent).toBe('Septembre');
    expect(tableRows[1].cells[1].textContent).toBe('Klaxit');
    expect(tableRows[1].cells[2].textContent).toBe('cloud_download');

    expect(tableRows[2].cells[0].textContent).toBe('Octobre');
    expect(tableRows[2].cells[1].textContent).toBe('Karos');
    expect(tableRows[2].cells[2].textContent).toBe('cloud_download');
  });

  // it('should show table view with 2 elements and no operator column for operator user', () => {
  //   // Arrange
  //   capitalCallServiceSpy.list.and.returnValue(of(s3ObjectList));
  //   commonDataServiceSpy.operators$ = of(operators);

  //   // Act
  //   createComponent();

  //   // Assert
  //   const tableRows = fixture.nativeElement.querySelectorAll('tr');
  //   expect(tableRows.length).toBe(3);

  //   // Header row
  //   const headerRow = tableRows[0];
  //   expect(headerRow.cells[0].textContent).toBe('Mois');
  //   expect(headerRow.cells[2].textContent).toBe('Action');

  //   // Data rows
  //   expect(tableRows[1].cells[0].textContent).toBe('Septembre');
  //   expect(tableRows[1].cells[3].textContent).toBe('cloud_download');

  //   expect(tableRows[2].cells[0].textContent).toBe('Octobre');
  //   expect(tableRows[2].cells[3].textContent).toBe('cloud_download');
  // });
});
