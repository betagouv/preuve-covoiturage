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

  it('should generate month RPC request param with a valid end date if none provided', () => {
    // Arrange
    const expectedEndDate: Date = new Date(new Date().setDate(new Date().getDate() - 5));
    expectedEndDate.setHours(2, 0, 0, 0);
    const start = new Date('2020-06-03T00:00:00.000Z');

    // Act
    const jsonRPCParam: JsonRPCParam = statApiService.paramGetList({
      group_by: ApiGraphTimeMode.Month,
      tz: 'Europe/Paris',
      date: {
        start,
      },
    });

    // Assert
    expect(statApiService).toBeTruthy();
    expect(jsonRPCParam.params.date.end).toBeTruthy();
    expect(jsonRPCParam.params.date.start).toEqual(start.toISOString());
    expect(jsonRPCParam.params.date.end).toEqual(expectedEndDate.toISOString());
    expect(jsonRPCParam.params.date.start).not.toEqual(expectedEndDate.toISOString());
  });

  it('should not generate end date request param when month time period is requested with a valid end date', () => {
    // Arrange
    const start = new Date('2020-06-03T00:00:00.000Z');
    const endDate = new Date(start.setDate(start.getDate() + 120));

    // Act
    const jsonRPCParam: JsonRPCParam = statApiService.paramGetList({
      group_by: ApiGraphTimeMode.Month,
      tz: 'Europe/Paris',
      date: {
        start,
        end: endDate,
      },
    });

    // Assert
    expect(statApiService).toBeTruthy();
    expect(jsonRPCParam.params.date.end).toBeTruthy();
    expect(jsonRPCParam.params.date.start).toEqual(start.toISOString());
    expect(jsonRPCParam.params.date.end).toEqual(endDate.toISOString());
  });
});
