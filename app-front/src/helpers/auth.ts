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
