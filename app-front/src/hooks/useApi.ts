import { useCallback, useEffect, useState } from "react";

type PaginateAPIResponse<T> = {
  meta?: { totalPages: number };
  data?: T[];
};

type ErrorResponse = {
  message: string;
};

type ApiResponse<T> = PaginateAPIResponse<T> | T | ErrorResponse;

export const useApi = <T>(
  url: string | URL,
  paginate = false,
  init?: RequestInit,
) => {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch(url, { ...init, credentials: "include" });
      const res = (await response.json()) as ApiResponse<T>;
      if (!response.ok) {
        throw new Error(
          (res as ErrorResponse).message ?? "Une erreur est survenue",
        );
      }

      if (
        paginate &&
        ((res as PaginateAPIResponse<T>).meta?.totalPages ?? 0) > 1
      ) {
        const paginateResponse = res as PaginateAPIResponse<T>;
        const endpoints: URL[] = [];
        for (let i = 2; i <= paginateResponse.meta!.totalPages; i++) {
          const endpoint = new URL(url);
          endpoint.searchParams.append("page", i.toString());
          endpoints.push(endpoint);
        }

        const responses = await Promise.all(
          endpoints.map((e) => fetch(e, { ...init, credentials: "include" })),
        );
        const datas = await Promise.all(responses.map((r) => r.json()));

        const combinedData = [
          ...("data" in paginateResponse
            ? (paginateResponse.data ?? [])
            : [paginateResponse]),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
          ...datas.flatMap((d) => ("data" in d ? d.data : [d])),
        ];

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        setData({ meta: paginateResponse.meta, data: combinedData } as T);
      } else {
        setData(res as T);
      }
    } catch (e) {
      setError(e as Error);
      setData(undefined);
    } finally {
      setLoading(false);
    }
  }, [url, init, paginate]);
  useEffect(() => {
    void fetchData();
  }, [fetchData]);
  return { data, error, loading, refetch: fetchData };
};
