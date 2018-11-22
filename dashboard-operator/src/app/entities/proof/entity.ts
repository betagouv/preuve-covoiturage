export class Proof {

  private id: number;
  private email: string;
  private lastname: string;
  private firstname: string;
  private numero: number;
  private operator: string;
  private operator_id: string;
  private start: Trip;
  private end: Trip;
  private is_driver: null;
  private traveler_hash: string; // todo: Temporary, it should be done in the backend !
  private trust_level: boolean; // todo: Temporary, should this be fixed to 0 or 1 ?

  constructor(obj?: any) {
    this.id           = obj && obj.id            || null;
    this.email        = obj && obj.email         || null;
    this.lastname     = obj && obj.lastname      || null;
    this.firstname    = obj && obj.firstname     || null;
    this.numero       = obj && obj.numero        || null;
    this.operator     = obj && obj.operator      || null;
    this.operator_id  = obj && obj.operator_id   || null;
    this.start        = obj && obj.start         || new Trip();
    this.end          = obj && obj.end           || new Trip();
    this.is_driver    = obj && obj.is_driver     || null;
    this.traveler_hash= obj && obj.traveler_hash || null;
    this.trust_level  = obj && obj.trust_level   || null;
  }


}

export class Trip {


  private insee: string;
  private date: string;
  private time: string;
  private literal: string;
  private latitude: string;
  private longitude: string;

  constructor(insee = null,date  = null,time  = null,literal  = null, latitude = null, longitude= null) {
    this.insee  =  insee        || null;
    this.date  =  date          || null;
    this.time  =  time          || null;
    this.literal  =  literal    || null;
    this.latitude =  latitude   || null;
    this.longitude=  longitude  || null;
  }


}
