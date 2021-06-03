import { StatApiService } from './stat-api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

describe('StatApiService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    }),
  );

  let statApiService: StatApiService;
  beforeEach(() => (statApiService = TestBed.inject(StatApiService)));

  it('should call api with right param', () => {
    expect(statApiService).toBeTruthy();
  });
});
