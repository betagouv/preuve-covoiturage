import { createHash } from "@/lib/crypto/index.ts";
import { removeAccents } from "@/lib/str/accents.ts";
import { Faker, fr } from "dep:faker";

const faker = new Faker({ locale: fr }) as Faker & { extra: any };
faker.extra = {
  siren(): string {
    return `1${faker.string.numeric(8)}`;
  },
  siret: (): string => {
    return `1${faker.string.numeric(8)}000${faker.number.int({ min: 10, max: 99 })}`;
  },
  immatriculation(): string {
    return `${faker.string.alpha(2)}-${faker.string.numeric(3)}-${faker.string.alpha(2)}`.toUpperCase();
  },
  phonetrunc(): string {
    return phonetrunc(faker.phone.number({ style: "international" }));
  },
  async identity_key(name: string, phone: string): Promise<string> {
    const n = removeAccents(name.toUpperCase()).slice(0, 3);
    return await createHash(`${phone}-${n}`);
  },
};

export function phonetrunc(phone: string): string {
  return phone.slice(0, phone.length - 2);
}

export function opt<T = unknown>(value: T): T | undefined {
  return faker.helpers.arrayElement([value, undefined]);
}

export { faker };
