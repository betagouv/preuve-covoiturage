import { useCallback, useEffect, useState } from "react";

export const useApi = <T>(url: string | URL, paginate: boolean = false, init?: RequestInit) => {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch(url, { ...init, credentials: "include" });
      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message || "Une erreur est survenue");
      }

      if (paginate && res.meta?.totalPages > 1) {
        const endpoints: URL[] = [];
        for (let i = 2; i <= res.meta.totalPages; i++) {
          const endpoint = new URL(url);
          endpoint.searchParams.append("page", i.toString());
          endpoints.push(endpoint);
        }

        const responses = await Promise.all(
          endpoints.map((e) => fetch(e, { ...init, credentials: "include" })),
        );
        const datas = await Promise.all(responses.map((r) => r.json()));

        const combinedData = [
          ...("data" in res ? res.data : [res]),
          ...datas.flatMap((d) => ("data" in d ? d.data : [d])),
        ];

        setData({ meta: res.meta, data: combinedData } as unknown as T);
      } else {
        setData(res);
      }
    } catch (e) {
      setError(e as Error);
      setData(undefined);
    } finally {
      setLoading(false);
    }
  }, [url, init, paginate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
};
