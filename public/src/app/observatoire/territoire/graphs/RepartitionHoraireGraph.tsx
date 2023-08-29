import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { Hour } from '@/interfaces/observatoire/Perimeter';
import { SearchParamsInterface } from '@/interfaces/observatoire/componentsInterfaces';
import { DistributionHoraireDataInterface } from '@/interfaces/observatoire/dataInterfaces';
import { fr } from '@codegouvfr/react-dsfr';
import { BarElement, CategoryScale, LinearScale, ChartData, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function RepartitionHoraireGraph({
  title,
  direction,
  params,
}: {
  title: string;
  direction: string;
  params: SearchParamsInterface;
}) {
  const options = {
    responsive: true,
    plugins:{
      legend: {
        display: false
      }
    },
  };

  const apiUrl = Config.get<string>('next.public_api_url', '');
  const url = `${apiUrl}/journeys-by-hours?code=${params.code}&type=${params.type}&year=${params.year}&month=${params.month}`;
  const { data, error, loading } = useApi<DistributionHoraireDataInterface[]>(url);

  const dataWithNull = (data:Hour[]) => {
    const arrayA = [...data]
    const arrayB:number[] = Array.from({length:24}, (v, k) => k);
    const lookupA = arrayA.reduce<Hour[]>((acc, curr) => ({ ...acc, [curr.hour]: curr }), {} as Hour[]);
    const result = arrayB.map((h) => lookupA[h] ?? { h, journeys: 0 });
    return result
  }

  const chartData = () => {
    const labels = ['0h','1h','2h','3h','4h','5h','6h','7h','8h','9h','10h','11h','12h','13h','14h','15h','16h','17h','18h','19h','20h','21h','22h','23h'];
    const datasets = [
      {
        data: data ? dataWithNull(data.find((d) => d.direction === direction)?.hours || []).map((d) => d.journeys) : [],
        borderColor:'#000091',
        backgroundColor:'rgba(0, 0, 145, 0.2)',
        tension: 0.1,
        datalabels: {
          labels: {
            title: null
          },
        },
      },
    ];
    return { labels: labels, datasets: datasets };
  };

  return (
    <>
      {loading && (
        <div className={fr.cx('fr-callout')}>
          <h3 className={fr.cx('fr-callout__title')}>{title}</h3>
          <div>Chargement en cours...</div>
        </div>
      )}
      {error && (
        <div className={fr.cx('fr-callout')}>
          <h3 className={fr.cx('fr-callout__title')}>{title}</h3>
          <div>{`Un problème est survenu au chargement des données: ${error}`}</div>
        </div>
      )}
      {!loading && !error && (
        <div className={fr.cx('fr-callout')}>
          <h3 className={fr.cx('fr-callout__title')}>{title}</h3>
          <div className='graph-wrapper' style={{ backgroundColor: '#fff' }}>
            <Bar options={options} data={chartData() as ChartData<"bar",number[]>} />
          </div>
        </div>
      )}
    </>
  );
}
