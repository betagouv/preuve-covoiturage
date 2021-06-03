export interface Operator {
  _id: number;
  name: string;
  legal_name: string;
  siret: string;
  company: any;
  contacts: any;
  bank: any;
  address: any;
  cgu_accepted_by?: string;
  cgu_accepted_at?: Date;
}

const defaultOperator: Operator = {
  _id: 0,
  name: '',
  legal_name: '',
  siret: '',
  company: {},
  contacts: {},
  bank: {},
  address: {},
};

export const maxiCovoit: Operator = {
  ...defaultOperator,
  _id: 1,
  name: 'MaxiCovoit',
  legal_name: 'Max y co',
  siret: '89248032800012',
};

export const operators: Operator[] = [maxiCovoit];
