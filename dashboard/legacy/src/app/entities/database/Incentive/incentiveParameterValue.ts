export class IncentiveParameterValue {
  key: string;
  value: string | number | boolean | null;

  constructor(obj?: any) {
    this.key = (obj && obj.policy) || null;
    this.value = (obj && obj.parameters) || null;
  }
}
