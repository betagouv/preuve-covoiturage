import { getUserCredentials } from './getUserCredentials';
import axios, { AxiosInstance } from 'axios';

export function createAxiosInstance(): AxiosInstance {
  return axios.create({
    baseURL: Cypress.env('API_URL'),
    withCredentials: true,
  });
}

export async function loginAsAdmin(instance: AxiosInstance) {
  try {
    const { login: email, password } = getUserCredentials();
    await instance.post('/login', {
      email,
      password,
    });
  } catch (e) {
    throw new Error(`Error during login as admin ${e.message} (${JSON.stringify(e)})`);
  }
  return;
}

const querySingleton: {
  axiosInstance: null | AxiosInstance;
} = {
  axiosInstance: null,
};

export async function adminQuery(method: string, params: { [k: string]: any } = {}): Promise<any> {
  if (!querySingleton.axiosInstance) {
    querySingleton.axiosInstance = createAxiosInstance();
    await loginAsAdmin(querySingleton.axiosInstance);
  }

  try {
    const response = await querySingleton.axiosInstance.post('/rpc', {
      id: 1,
      method,
      params,
    });
    if ('error' in response.data) {
      throw new Error(response.data.error);
    }

    return response.data.result;
  } catch (e) {
    if (e.isAxiosError) {
      throw new Error(e.response.data.error);
    }
    throw e;
  }
}
