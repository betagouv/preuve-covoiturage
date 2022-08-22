import { TestBed } from '@angular/core/testing';

import { CapitalcallApiService } from './capitalcall-api.service';

describe('CapitalcallApiService', () => {
  let service: CapitalcallApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapitalcallApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
