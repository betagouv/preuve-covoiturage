import { Parents, Container, Exceptions, Types, Interfaces } from '@ilos/core';


/*
 * Enrich journey with geographic data
 */
@Container.handler({
  service: 'normalization',
  method: 'geo',
})
export class NormalizationGeoAction extends Parents.Action {
  constructor(
  ) {
    super();
  }

  public async handle(request: Types.ParamsType, context: Types.ContextType): Promise<void> {
    const journey = request.safeJourney;
  }

  private findTownByInsee = async ({ journey, path, position }) => {
    const pos = { ...position };
    const jrn = { ...journey };

    if (_.get(position, 'insee', null) !== null) {
      return this.geoProvider.findTownByInsee.town(pos.insee)
        .then(this.processTownResponse({ jrn, path, pos }));
    }

    return { journey, path, position };
  }


  private processTownResponse = ({ jrn, path, pos }) => async ({ town, postcodes, insee, country, lon, lat }) => {
    const position = { ...pos };
    const journey = { ...jrn };

    if (lon && !position.lon) {
      position.lon = lon;
      _.set(journey, `${path}.lon`, lon);
    }

    if (lat && !position.lat) {
      position.lat = lat;
      _.set(journey, `${path}.lat`, lat);
    }

    if (insee && !position.insee) {
      position.insee = insee;
      _.set(journey, `${path}.insee`, insee);
    }

    if (town && !position.town) {
      position.town = town;
      _.set(journey, `${path}.town`, town);
    }

    if (country && !position.country) {
      position.country = country;
      _.set(journey, `${path}.country`, country);
    }

    // concat postcodes with existing ones
    const pcs = _.get(jrn, `${path}.postcodes`, []).concat(postcodes);
    position.postcodes = _.uniq(pcs);
    _.set(journey, `${path}.postcodes`, position.postcodes);

    return { journey, path, position };
  }
}
