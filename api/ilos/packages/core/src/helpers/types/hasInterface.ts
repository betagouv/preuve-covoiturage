export function hasInterface<T>(object: any, discriminator: string): object is T {
  return discriminator in object;
}
