import { useState, useEffect } from 'react';
import { useFetchClient } from '@strapi/helper-plugin';
import pluginId from '../pluginId';

export function useFlowList():[Array<string>, boolean] {
  const { get } = useFetchClient();
  const [isLoading, setIsLoading] = useState(false); 
  const [flows, setFlows] = useState<Array<string>>([]);

  useEffect(() => {
    setIsLoading(true);
    get(`${pluginId}/flows`)
      .then((d: any) => {
        setFlows(d.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return [flows, isLoading];
}
