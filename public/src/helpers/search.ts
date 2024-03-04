import { Config } from '@/config';
import { search } from '@/config/search';

export const searchHost = Config.get<string>('search.host');

export const fetchSearchAPI = async (path:string, options = {}) => {
  try {
    const mergedOptions = {
      headers: search.headers,
      ...options,
    };
    // Build request URL
    const requestUrl = `${searchHost}/${path}`;
    const response = await fetch(requestUrl, mergedOptions);
    const data = await response.json();
    return data;
  }
  catch(e){
    console.error(e);
    throw new Error(`Please check if your server is running and you set all the required tokens.`);
  }
}