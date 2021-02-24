import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorLogoUploadComponent } from './operator-logo-upload.component';

describe('OperatorLogoUploadComponent', () => {
  let component: OperatorLogoUploadComponent;
  let fixture: ComponentFixture<OperatorLogoUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OperatorLogoUploadComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorLogoUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
