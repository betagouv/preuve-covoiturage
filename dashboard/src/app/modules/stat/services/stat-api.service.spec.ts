import { JsonRPCParam } from './../../../core/entities/api/jsonRPCParam';
import { StatApiService } from './stat-api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { ApiGraphTimeMode } from './ApiGraphTimeMode';

describe('StatApiService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [StatApiService],
    }),
  );

  let statApiService: StatApiService;
  beforeEach(() => (statApiService = TestBed.inject(StatApiService)));

  const start = new Date('2020-06-03T00:00:00.000Z');

  it('should generate month RPC request param with a valid end date if none provided', () => {
    expect(statApiService).toBeTruthy();
    const jsonRPCParam: JsonRPCParam = statApiService.paramGetList({
      group_by: ApiGraphTimeMode.Month,
      tz: 'Europe/Paris',
      date: {
        start,
      },
    });

    const expectedEndDate: Date = new Date(new Date().setDate(new Date().getDate() - 5));
    expectedEndDate.setHours(2, 0, 0, 0);

    expect(jsonRPCParam.params.date.end).toBeTruthy();
    expect(jsonRPCParam.params.date.end).toBe(expectedEndDate.toISOString());
  });

  it('should generate day RPC request param with a valid end date if none', () => {
    expect(statApiService).toBeTruthy();

    const jsonRPCParam: JsonRPCParam = statApiService.paramGetList({
      group_by: ApiGraphTimeMode.Day,
      tz: 'Europe/Paris',
      date: {
        start,
      },
    });
    expect(jsonRPCParam.params.date.end).toBeTruthy();

    const expectedEndDate: Date = new Date(start.setDate(start.getDate() + 14));
    expectedEndDate.setHours(2, 0, 0, 0);

    expect(jsonRPCParam.params.date.end).toBe(expectedEndDate.toISOString());
  });
});
