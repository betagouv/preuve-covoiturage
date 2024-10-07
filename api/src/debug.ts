import { bootstrap as app } from "./pdc/proxy/bootstrap.ts";

export async function getKernel() {
  const Kernel = app.kernel();
  const kernel = new Kernel();
  await kernel.bootstrap();
  return kernel;
}
