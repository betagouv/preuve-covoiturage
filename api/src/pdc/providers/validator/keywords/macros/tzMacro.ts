import { timezones } from "../../types.ts";

export function tzMacro(): {
  type: string;
  enum: string[];
  minLength: number;
  maxLength: number;
} {
  return {
    type: "string",
    minLength: 2,
    maxLength: 64,
    enum: [...timezones],
  };
}
