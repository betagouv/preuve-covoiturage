import { getApiUrl } from '@/helpers/api';
import { useApi } from '@/hooks/useApi';
import { Directions, Periods } from '@/interfaces/vizInterface';
import { fr } from '@codegouvfr/react-dsfr';
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
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
import { useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);


export default function OperatorsGraph(props: {title:string, territoryId:number}) {
  const [period, setPeriod] = useState<Periods>('month');
  const [direction, setDirection] = useState<Directions>('both');
  const url = getApiUrl('v3', `dashboard/operators/${period}/?direction=${direction}&territory_id=${props.territoryId}`)
  const { data } = useApi<Record<string, string | number>[]>(url);
  const name = [...new Set(data?.map(d => d.operator_name))] as string[]
  const colors = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f','#667dcf','#72b77a']
  const labels = period === 'month' 
    ? [...new Set(data?.map(d => `${String(d.month).padStart(2, "0")}/${d.year}`))] as string[]
    : [...new Set(data?.map(d => d.start_date))] as string[]

  const datasets = name.map((n,i) => {
    const dataOp = data?.filter(d => d.operator_name === n) ?? []
    return {
      data:labels.map(t=>{
        return period === 'month' 
          ? dataOp.find(d => `${String(d.month).padStart(2, "0")}/${d.year}` === t)?.journeys ?? 0
          : dataOp.find(d => d.start_date === t)?.journeys ?? 0;
      }),
      fill: true,
      borderColor: colors[i],
      backgroundColor:`${colors[i]}33`,
      tension: 0.1,
      label:n
    }
  });
  const chartData = { labels: labels, datasets: datasets };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };
  
  return(
    <>
      <h3 className={fr.cx('fr-callout__title')}>{props.title}</h3>
      <ul className={fr.cx('fr-tags-group')}>
        <li>
          <Select
              label=""
              nativeSelectProps={{
                  onChange: (e) => setDirection(e.target.value as Directions)
              }}
          >
              <option value="both">Tout sens confondus</option>
              <option value="from">Origine</option>
              <option value="to">Destination</option>
        
          </Select>              
        </li>
        <li>
          <Tag 
            nativeButtonProps={{
              onClick:  ()=>{setPeriod('month')}
            }}
            pressed={period === 'month' ? true : false}
          >
            Evolution mensuelle
          </Tag>
        </li>
        <li>
          <Tag 
            nativeButtonProps={{
              onClick: ()=>{setPeriod('day')}
            }}
            pressed={period === 'day' ? true : false}
          >
            Evolution journalière
          </Tag>
        </li>
      </ul>
      <Line options={options} data={chartData} aria-hidden />
    </>    
  );
}