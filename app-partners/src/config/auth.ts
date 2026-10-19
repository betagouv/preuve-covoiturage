export const auth = {
  domain: `${process.env.NEXT_PUBLIC_API_URL}`,
  redirect: `${process.env.NEXT_PUBLIC_API_REDIRECT}`,
  // Vide (et non "undefined") quand la variable manque : le profil replie alors sur la production.
  pc_uri: process.env.NEXT_PUBLIC_PC_USER_URI ?? "",
};
