export type DefaultMetaInterface = { [k:string]: any };

export interface FraudCheckMeta<T extends DefaultMetaInterface = DefaultMetaInterface> {
  meta: T;
}

export interface FraudCheckResult<T extends DefaultMetaInterface = DefaultMetaInterface> extends FraudCheckMeta<T> {
  karma: number;
}

export interface FraudCheck<T extends DefaultMetaInterface = DefaultMetaInterface> extends FraudCheckResult<T> {
  _id: number;
  status: string;
}

export interface FraudCheckComplete extends FraudCheck {
  method: string;
  acquisition_id: number;
}
