import { Config } from "@/config";
import { search } from "@/config/search";
// eslint-disable-next-line prettier/prettier
import type { PerimeterType, TerritoryListInterface } from "@/interfaces/searchInterface";

export const searchHost = Config.get<string>("search.host");

export const fetchSearchAPI = async <T>(
  path: string,
  options = {},
): Promise<T> => {
  try {
    const mergedOptions = {
      headers: search.headers,
      ...options,
    };
    // Build request URL
    const requestUrl = `${searchHost}/${path}`;
    const response = await fetch(requestUrl, mergedOptions);
    const data = (await response.json()) as T;
    return data;
  } catch (e) {
    console.error(e);
    throw new Error(
      `Please check if your server is running and you set all the required tokens.`,
    );
  }
};

export const castPerimeterType = (value: PerimeterType) => {
  switch (value) {
    case "com":
      return "Commune";
    case "epci":
      return "Communauté de commune";
    case "aom":
      return "Autorité organisatrice des mobilités";
    case "dep":
      return "Département";
    case "reg":
      return "Région";
    case "country":
      return "Pays";
  }
};

export const getUrl = (url: string, option?: TerritoryListInterface) => {
  return `/observatoire/${url}${option ? `?code=${option.territory.slice(0, 9)}&type=${option.type}` : ""}`;
};
