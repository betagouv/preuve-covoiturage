export function isCallable(fn: Function): fn is CallableFunction {
  return (<CallableFunction>fn).apply !== undefined;
}
