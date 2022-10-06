import { TestBed } from '@angular/core/testing';

import { FundingRequestsApiService } from './fundingrequests-api.service';

describe('FundingRequestsApiService', () => {
  let service: FundingRequestsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FundingRequestsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
