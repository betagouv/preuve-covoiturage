'use client'
import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import dynamic from "next/dynamic";
const MultiLineChart = dynamic(() => import("@codegouvfr/react-dsfr/Chart/MultiLineChart"), {
  ssr: false
});

export default function TabBref2() {
  const url = Config.get<string>("next.public_api_url", "");
  const { data } = useApi<Record<string, string | number>[]>(`${url}/v3/dashboard/operators/month?territory_id=36101`);
  const name = [...new Set(data?.map(d => d.operator_name))] as string[]
  const time = [...new Set(data?.map(d => `${String(d.month).padStart(2, "0")}/${d.year}`))] as string[]
  const dataset = name.map(n => {
    const dataOp = data?.filter(d => d.operator_name === n) ?? []
    return time.map(t=>{
      return dataOp.find(d => `${String(d.month).padStart(2, "0")}/${d.year}` === t)?.journeys ?? 0;
    })
  }) as number[][];
  return(
    <>
      <MultiLineChart
        x={[time]}
        y={dataset}
        name={name}
      />
    </>
  );
}