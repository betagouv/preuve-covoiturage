export function emailMacro(): {
  type: string;
  format: string;
  minLength: number;
  maxLength: number;
  sanitize: boolean;
} {
  return {
    type: "string",
    format: "email",
    minLength: 5,
    maxLength: 256,
    sanitize: true,
  };
}
