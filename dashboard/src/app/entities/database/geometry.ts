export class Geometry {
  type: string;
  coordinates: [];

  constructor(obj?: any) {
    this.type = obj && obj.type || null;
    this.coordinates = obj && obj.coordinates || [];
  }
}
