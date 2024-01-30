import { useState } from 'react';
import { useFetchClient } from '@strapi/helper-plugin';
import pluginId from '../pluginId';

export function useFlowRun(id: string) {
  const { post } = useFetchClient();
  const [isLoading, setIsLoading] = useState(false); 
  const [isError, setIsError] = useState(false); 

  async function run() {
    setIsLoading(true);
    try {
      await post(`${pluginId}/flows/${id}`);
      setIsError(false);
    } catch(e) {
      console.error(e)
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }
  return [run, isLoading, isError];
}
