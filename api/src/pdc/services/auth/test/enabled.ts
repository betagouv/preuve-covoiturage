const FORBIDDEN_ENVS = ["demo", "production"];

// Both NODE_ENV and APP_ENV are checked: a mismatch between them must not open the route
export function isTestAuthEnabled(envs: string | string[], flag: boolean): boolean {
  const list = Array.isArray(envs) ? envs : [envs];
  return flag === true && !list.some((env) => FORBIDDEN_ENVS.includes(env));
}
