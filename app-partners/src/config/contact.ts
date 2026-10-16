// Inliné au build (export statique) : NEXT_PUBLIC_CONTACT_EMAIL, adresse générique à défaut (même si vide).
export const contact = {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@covoiturage.beta.gouv.fr",
};
