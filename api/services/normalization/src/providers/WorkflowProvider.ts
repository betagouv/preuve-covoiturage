import {
  provider,
  InitHookInterface,
  ConfigInterfaceResolver,
  ContextType,
  KernelInterfaceResolver,
  HasLogger,
} from '@ilos/common';

import {
  signature as finalStepSignature,
  ParamsInterface as FinalParamsInterface,
} from '../shared/carpool/crosscheck.contract';

const context: ContextType = {
  call: {
    user: {},
  },
  channel: {
    service: 'normalization',
    transport: 'queue',
  },
};

@provider()
export class WorkflowProvider extends HasLogger implements InitHookInterface {
  protected steps: string[] = [];
  protected finalStep: string = finalStepSignature;

  constructor(protected config: ConfigInterfaceResolver, protected kernel: KernelInterfaceResolver) {
    super();
  }

  async init() {
    this.steps = this.config.get('workflow.steps');
  }

  async next(currentState: string, data: any): Promise<void> {
    const nextStep = this.getNextStep(currentState);
    if (nextStep) {
      this.logger.debug(`Found ${nextStep}`);
      return this.kernel.notify(nextStep, data, context);
    }
    this.logger.debug(`Workflow ended`);
    return this.end(data);
  }

  protected getNextStep(currentState: string): string | null {
    this.logger.debug(`Find next step from ${currentState}`, this.steps);

    const index = this.steps.indexOf(currentState) + 1;
    if (this.steps.length > index && index !== 0) {
      return this.steps[index];
    }

    return null;
  }

  protected async end(data: any): Promise<void> {
    const people = [];

    const driverStart = data.payload.driver.start.datetime;
    const driverEnd = data.payload.driver.end.datetime;
    const driverDuration = Math.floor(
      ((driverEnd.getTime ? driverEnd.getTime() : new Date(driverEnd).getTime()) -
        (driverStart.getTime ? driverStart.getTime() : new Date(driverStart).getTime())) /
        1000,
    );

    people.push({
      is_driver: true,
      datetime: data.payload.driver.start.datetime,
      start: {
        lon: data.payload.driver.start.lon,
        lat: data.payload.driver.start.lat,
        insee: data.payload.driver.start.insee,
      },
      end: {
        lon: data.payload.driver.end.lon,
        lat: data.payload.driver.end.lat,
        insee: data.payload.driver.end.insee,
      },
      seats: data.payload.driver.seats || 0, // or 0
      duration: driverDuration,
      distance: data.payload.driver.distance,
      identity: data.payload.driver.identity,
      cost: data.payload.driver.cost,
      meta: {
        payments: [...data.payload.driver.payments],
        calc_distance: data.payload.driver.calc_distance,
        calc_duration: data.payload.driver.calc_duration,
      },
    });

    const passengerStart = data.payload.driver.start.datetime;
    const passengerEnd = data.payload.driver.end.datetime;
    const passengerDuration = Math.floor(
      ((passengerEnd.getTime ? passengerEnd.getTime() : new Date(passengerEnd).getTime()) -
        (passengerStart.getTime ? passengerStart.getTime() : new Date(passengerStart).getTime())) /
        1000,
    );

    people.push({
      is_driver: false,
      datetime: data.payload.passenger.start.datetime,
      start: {
        lon: data.payload.passenger.start.lon,
        lat: data.payload.passenger.start.lat,
        insee: data.payload.passenger.start.insee,
      },
      end: {
        lon: data.payload.passenger.end.lon,
        lat: data.payload.passenger.end.lat,
        insee: data.payload.passenger.end.insee,
      },
      seats: data.payload.passenger.seats || 1,
      duration: passengerDuration,
      distance: data.payload.passenger.distance,
      identity: data.payload.passenger.identity,
      cost: data.payload.passenger.cost,
      meta: {
        payments: [...data.payload.passenger.payments],
        calc_distance: data.payload.passenger.calc_distance,
        calc_duration: data.payload.passenger.calc_duration,
      },
    });

    const normalizedData: FinalParamsInterface = {
      people,
      operator_trip_id: data.payload.operator_journey_id,
      created_at: data.created_at,
      operator_id: data.operator_id,
      operator_class: data.payload.operator_class,
      acquisition_id: data._id,
      operator_journey_id: data.journey_id,
    };

    return this.kernel.notify<FinalParamsInterface>(this.finalStep, normalizedData, context);
  }
}
