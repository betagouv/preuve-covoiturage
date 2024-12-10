'use client'
import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function TabBref2() {
  const url = Config.get<string>("next.public_api_url", "");
  const { data } = useApi<Record<string, string | number>[]>(`${url}/v3/dashboard/operators/month?territory_id=36101`);
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };
  const name = [...new Set(data?.map(d => d.operator_name))] as string[]
  const colors = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f','#667dcf','#72b77a']
  const labels = [...new Set(data?.map(d => `${String(d.month).padStart(2, "0")}/${d.year}`))] as string[]
  const datasets = name.map((n,i) => {
    const dataOp = data?.filter(d => d.operator_name === n) ?? []
    return {
      data:labels.map(t=>{
        return dataOp.find(d => `${String(d.month).padStart(2, "0")}/${d.year}` === t)?.journeys ?? 0;
      }),
      fill: true,
      borderColor: colors[i],
      backgroundColor:`${colors[i]}33`,
      tension: 0.1,
      label:n
    }
  });
  const chartData = { labels: labels, datasets: datasets };
  
  return(
      <Line options={options} data={chartData} aria-hidden />    
  );
}