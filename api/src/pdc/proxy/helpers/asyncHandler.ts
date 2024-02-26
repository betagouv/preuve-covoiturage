export function asyncHandler(fn: Function): any {
  return (req, res, next): Promise<any> => Promise.resolve(fn(req, res, next)).catch(next);
}
