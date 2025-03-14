import { useEffect, useState } from "react";

export const useApi = <T>(
  url: string | URL,
  paginate = false,
  init?: RequestInit,
) => {
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          const datas = await Promise.all(responses.map(async (r) => r.json()));
          // Fusionner les données de la première page et des pages suivantes
          const combinedData = [
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            ...("data" in res ? res.data : [res]),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
            ...datas.flatMap((d) => ("data" in d ? d.data : [d])),
          ];
          setData({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            meta: res.meta,
            data: combinedData,
          } as unknown as T);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setData(res);
        }
      } catch (e) {
        setError(e as Error);
        setData(undefined);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, init]);

  return { data, error, loading };
};
