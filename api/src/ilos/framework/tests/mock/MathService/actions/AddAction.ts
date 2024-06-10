import { Action } from "@/ilos/core/index.ts";
import {
  ContextType,
  handler,
  InvalidParamsException,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";

import { CustomProvider } from "../../Providers/CustomProvider.ts";

@handler({
  service: "math",
  method: "add",
})
export class AddAction extends Action {
  constructor(public custom: CustomProvider) {
    super();
  }

  protected async handle(
    params: ParamsType,
    context: ContextType,
  ): Promise<ResultType> {
    if (!Array.isArray(params)) {
      throw new InvalidParamsException();
    }
    let result = 0;
    params.forEach((add: number) => {
      result += add;
    });
    return `${this.custom.get()}${result}`;
  }
}
