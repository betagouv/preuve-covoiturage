import { useState, useEffect } from 'react';
import { cmsInstance } from "@/helpers/cms";
export const useJson = <T>(id:string) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await cmsInstance.files.readByQuery({
        id: id
      });
      if (data) {
        setData(JSON.parse(res));
        setError(null);
      } else {
        setError(JSON.parse(res));
        setData(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);
  return { data, error, loading };
};
