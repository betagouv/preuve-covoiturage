export function isCallable(fn: Function): fn is CallableFunction {
  return (fn as CallableFunction).apply !== undefined;
}
