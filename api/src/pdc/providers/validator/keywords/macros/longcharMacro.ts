export function longcharMacro(): {
  type: string;
  minLength: number;
  maxLength: number;
  sanitize: boolean;
} {
  return {
    type: "string",
    minLength: 1,
    maxLength: 512,
    sanitize: true,
  };
}
