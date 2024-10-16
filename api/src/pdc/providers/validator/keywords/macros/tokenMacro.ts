export function tokenMacro(): {
  type: string;
  minLength: number;
  maxLength: number;
  trim: boolean;
} {
  return {
    type: "string",
    minLength: 32,
    maxLength: 64,
    trim: true,
  };
}
