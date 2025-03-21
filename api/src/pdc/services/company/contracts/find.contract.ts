import { CompanyInterface } from "../../../../shared/common/interfaces/CompanyInterface2.ts";

export interface ParamsInterface {
  query: {
    siret?: string;
    _id?: number;
  };
  forceRemoteUpdate?: boolean;
}

export interface ResultInterface extends CompanyInterface {}

export const handlerConfig = {
  service: "company",
  method: "find",
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
