import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CampaignApiService } from '../../services/campaign-api.service';

import { CampaignCapitalcallComponent } from './campaign-capitalcall.component';

fdescribe('CampaignCapitalcallComponent', () => {
  let component: CampaignCapitalcallComponent;
  let fixture: ComponentFixture<CampaignCapitalcallComponent>;

  // const campaignApiServiceSpy = jasmine.createSpyObj<CampaignApiService>('CampaignApiService', {
  //   create: of(territory),
  //   update: of(territory),
  //   findGeoBySiren: of(findBySiretResult),
  // });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CampaignCapitalcallComponent],
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [CampaignApiService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignCapitalcallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
