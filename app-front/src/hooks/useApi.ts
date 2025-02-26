import { useEffect, useState } from "react";

export const useApi = <T>(url: string | URL, paginate: boolean = false, init?: RequestInit) => {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(undefined);
        setLoading(true);
        // Récupération de la première page
        const response = await fetch(url, { ...init, credentials: "include" });
        const res = await response.json();
        if (!response.ok) {
          throw res;
        }
        // Si plusieurs pages, on charge les pages suivantes
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
          const datas = await Promise.all(
            responses.map(async (r) => r.json()),
          );
          // Fusionner les données de la première page et des pages suivantes
          const combinedData = [
            ...("data" in res ? res.data : [res]),
            ...datas.flatMap((d) => ("data" in d ? d.data : [d])),
          ];
          setData({
            meta: res.meta,
            data: combinedData,
          } as unknown as T);
        } else {
          setData(res);
        }
      } catch (e) {
        setError(e as Error);
        setData(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, init]);

  return { data, error, loading };
};
