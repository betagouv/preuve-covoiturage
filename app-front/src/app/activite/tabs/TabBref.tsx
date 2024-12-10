'use client'
import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import dynamic from "next/dynamic";
const MultiLineChart = dynamic(() => import("@codegouvfr/react-dsfr/Chart/MultiLineChart"), {
  ssr: false
});

export default function TabBref() {
  const url = Config.get<string>("next.public_api_url", "");
  const { data } = useApi<Record<string, string | number>[]>(`${url}/v3/dashboard/operators/month?territory_id=36101`);
  const name = data?.map(d => d.operator_name) as string[]
  return(
    <>
      <MultiLineChart
         x={[
          [
            1,
            2,
            3
          ],
          [
            1,
            2,
            3
          ]
        ]}
        y={[
          [
            30,
            10,
            20
          ],
          [
            10,
            20,
            30
          ]
        ]}
        name={name}
      />
    </>
  );
}