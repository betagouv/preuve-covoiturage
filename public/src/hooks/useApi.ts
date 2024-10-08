import { useEffect, useState } from "react";
export const useApi = <T>(input: RequestInfo | URL, init?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      setLoading(true);
      const response = await fetch(input, init);
      const res = await response.json();
      if (response.ok) {
        setData(res.result.data);
        setLoading(false);
      } else {
        setError(res.error.data);
        setData(null);
        setLoading(false);
      }
    };
    fetchData();
  }, [input, init]);
  return { data, error, loading };
};
