export class StatConfig {
  type: string;
  title: string;
  name: string;
  cumul: boolean;
  map: string;
  img: string;
  unit: string;
  unitTransformation: string;
  precision: number;
  labels: [];
  style: {};
  options: {};

  constructor(obj?: any) {
    this.type = (obj && obj.type) || null;
    this.title = (obj && obj.title) || null;
    this.name = (obj && obj.name) || null;
    this.cumul = (obj && obj.cumul) || null;
    this.map = (obj && obj.map) || null;
    this.img = (obj && obj.img) || null;
    this.unit = (obj && obj.unit) || null;
    this.unitTransformation = (obj && obj.unitTransformation) || null;
    this.precision = (obj && obj.precision) || null;
    this.labels = (obj && obj.labels) || [];
    this.style = (obj && obj.style) || null;
    this.options = (obj && obj.options) || null;
  }
}
