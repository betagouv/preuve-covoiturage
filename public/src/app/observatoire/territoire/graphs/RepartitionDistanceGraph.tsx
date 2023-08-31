import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { SearchParamsInterface } from '@/interfaces/observatoire/componentsInterfaces';
import { DistributionDistanceDataInterface } from '@/interfaces/observatoire/dataInterfaces';
import { fr } from '@codegouvfr/react-dsfr';
import { ArcElement, ChartData, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {Context} from 'chartjs-plugin-datalabels';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

export default function RepartitionDistanceGraph({
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
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const apiUrl = Config.get<string>('next.public_api_url', '');
  const url = `${apiUrl}/journeys-by-distances?code=${params.code}&type=${params.type}&year=${params.year}&month=${params.month}`;
  const { data, error, loading } = useApi<DistributionDistanceDataInterface[]>(url);
  const plugins: any = [ChartDataLabels];
  const chartData = () => {
    const labels = ['< 10 km', '10-20 km', '20-30 km', '30-40 km', '40-50 km', '> 50 km'];
    const datasets = [
      {
        data: data ? data.find((d) => d.direction === direction)?.distances.map((d) => d.journeys) : [],
        backgroundColor: ['#08519c', '#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#eff3ff'],
        datalabels: {
          labels: {
            name: {
              align: 'middle',
              font: (context: Context) => {
                const avgSize = Math.round((context.chart.height + context.chart.width) / 2);
                const params = {
                  size: Math.round(avgSize / 24) > 10 ? 14 : Math.round(avgSize / 24),
                  weight: 'bold',
                };
                return params;
              },
              color: 'black',
              formatter: (value: number, ctx: Context) => {
                return ctx.chart.data.labels ? ctx.chart.data.labels[ctx.dataIndex] : '';
              },
            },
            value: {
              align: 'bottom',
              color: 'black',
              font: (context: Context) => {
                const avgSize = Math.round((context.chart.height + context.chart.width) / 2);
                const params = {
                  size: Math.round(avgSize / 24) > 10 ? 12 : Math.round(avgSize / 24),
                };
                return params;
              },
              formatter: (value: number, ctx: Context) => {
                let sum = 0;
                const dataArr = ctx.chart.data.datasets[0].data as number[];
                dataArr.map((data: number) => {
                  sum += data;
                });
                const percentage = ((value * 100) / sum).toFixed(1) + '%';
                return percentage;
              },
            },
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
            <Doughnut options={options} plugins={plugins} data={chartData() as ChartData<"doughnut",number[]>} />
          </div>
        </div>
      )}
    </>
  );
}
