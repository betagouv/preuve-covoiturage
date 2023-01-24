import { TestBed } from '@angular/core/testing';

import { ApdfApiService } from './apdf-api.service';

describe('ApdfApiService', () => {
  let service: ApdfApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApdfApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
