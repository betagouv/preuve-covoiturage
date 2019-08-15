export class Position {
  public insee: string;
  public datetime: string;
  public literal: string;
  public latitude: string;
  public longitude: string;

  constructor(obj?: any) {
    this.insee = (obj && obj.insee) || null;
    this.datetime = (obj && obj.datetime) || null;
    this.literal = (obj && obj.literal) || null;
    this.latitude = (obj && obj.latitude) || null;
    this.longitude = (obj && obj.longitude) || null;
  }
}
