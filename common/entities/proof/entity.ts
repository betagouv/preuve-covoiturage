export class Proof {

  private id: number;
  private email: string;
  private lastname: string;
  private firstname: string;
  private numero: number;
  private operator_id: string;
  private start: Journey;
  private end: Journey;
  private is_driver: null;
  private traveler_hash: string; // todo: Temporary, it should be done in the backend !
  private trust_level: boolean; // todo: Temporary, should this be fixed to 0 or 1 ?
  private trip_id: boolean; // connection made by operator ( should be in documentation )

  constructor(obj?: any) {
    this.id           = obj && obj.id            || null;
    this.email        = obj && obj.email         || null;
    this.lastname     = obj && obj.lastname      || null;
    this.firstname    = obj && obj.firstname     || null;
    this.numero       = obj && obj.numero        || null;
    this.operator_id  = obj && obj.operator_id   || null;
    this.start        = obj && obj.start         || new Journey();
    this.end          = obj && obj.end           || new Journey();
    this.is_driver    = obj && obj.is_driver     || null;
    this.traveler_hash= obj && obj.traveler_hash || null;
    this.trust_level  = obj && obj.trust_level   || null;
    this.trip_id  = obj && obj.trip_id   || null;
  }


}

export class Journey {


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
