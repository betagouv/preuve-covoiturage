import crypto from "crypto";

export const generateNonce = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const addParamsToUrl = (url: string, params: object) => {
  const queryString = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryString.append(key, value);
  });
  return `${url}?${queryString.toString()}`;
};

export const labelRole = (role: string) => {
  switch (role) {
    case "registry.admin":
      return "Administrateur RPC";
    case "territory.user":
      return "Utilisateur territoire";
    case "territory.admin":
      return "Administrateur territoire";
    case "operator.user":
      return "Utilisateur opérateur";
    case "operator.admin":
      return "Administrateur opérateur";
    case "anonymous":
      return "Anonyme";
    default:
      return role;
  }
};

export const enumRoles = [
  "registry.admin",
  "territory.user",
  "territory.admin",
  "operator.user",
  "operator.admin",
] as const;

export const enumTypes = [
  "town",
  "towngroup",
  "district",
  "region",
  "country",
] as const;

export const labelType = (type: string) => {
  switch (type) {
    case "town":
      return "Commune";
    case "towngroup":
      return "AOM";
    case "district":
      return "Département";
    case "region":
      return "Région";
    case "country":
      return "Pays";
    default:
      return type;
  }
};
