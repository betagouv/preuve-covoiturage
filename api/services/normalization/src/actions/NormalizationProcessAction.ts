import { Parents, Container, Exceptions, Types, Interfaces } from '@ilos/core';


/*
 * Process journey through normalization pipe
 */
@Container.handler({
  service: 'normalization',
  method: 'process',
})
export class NormalizationProcessAction extends Parents.Action {
  constructor(
    private kernel: Interfaces.KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: Types.ParamsType, context: Types.ContextType): Promise<void> {
    const safeJourney = request.safeJourney;


    const geoEnrichedJourney = await this.normalizeGeo(safeJourney);

    // const theoreticTravelEnrichedJourney = await this.normalizeTheoreticTravel(geoEnrichedJourney);

    // const aomEnrichedJourney = await this.findAom();

    // call cross check/merge
  }

  private async normalizeGeo(safeJourney) {
    const paths = [
      'passenger.start',
      'passenger.end',
      'driver.start',
      'driver.end',
    ];

    let normalizedJourney = {};

    paths.map(async (path) => {
      const position = _.get(safeJourney, path);
      const positionEnrichedWithTown = await this.findTown(position);
      normalizedJourney = this.processTownResponse(safeJourney, path, position, positionEnrichedWithTown);
    });

    return normalizedJourney;
  }

  private async findTown(position) {
    const pos = { ...position };

    return this.geoProvider
      .town({ lon: pos.lon, lat: pos.lat, insee: pos.insee, literal: pos.literal });
  }


  private processTownResponse(jrn, path, pos, determinedPosition) {
    const position = { ...pos };
    const journey = { ...jrn };

    if (determinedPosition.lon && !position.lon) {
      position.lon = determinedPosition.lon;
      _.set(journey, `${path}.lon`, determinedPosition.lon);
    }

    if (determinedPosition.lat && !position.lat) {
      position.lat = determinedPosition.lat;
      _.set(journey, `${path}.lat`, determinedPosition.lat);
    }

    if (determinedPosition.insee && !position.insee) {
      position.insee = determinedPosition.insee;
      _.set(journey, `${path}.insee`, determinedPosition.insee);
    }

    if (determinedPosition.town && !position.town) {
      position.town = determinedPosition.town;
      _.set(journey, `${path}.town`, determinedPosition.town);
    }

    if (determinedPosition.country && !position.country) {
      position.country = determinedPosition.country;
      _.set(journey, `${path}.country`, determinedPosition.country);
    }

    // concat postcodes with existing ones
    const pcs = _.get(jrn, `${path}.postcodes`, []).concat(determinedPosition.postcodes);
    position.postcodes = _.uniq(pcs);
    _.set(journey, `${path}.postcodes`, position.postcodes);

    return journey;
  }


}
