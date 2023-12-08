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
  params,
}: {
  title: string;
  params: SearchParamsInterface;
}) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
  const datasetFrom = data?.find((d) => d.direction === 'from')?.distances.map((d) => d.journeys);
  const datasetSum = (dataset: number[]) => {
    let sum = 0;
    dataset.map((d) => {
      sum += d;
    });
    return sum;
  };
  const datasetTo = data?.find((d) => d.direction === 'to')?.distances.map((d) => d.journeys);
  const chartData = () => {
    const labels = ['< 10 km', '10-20 km', '20-30 km', '30-40 km', '40-50 km', '> 50 km'];
    const datasets = [
      {
        label: 'Origine',
        data: datasetFrom,
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
      }
    ];
    params.type !== 'country' ? datasets.push(
      {
        label: 'Destination',
        data: datasetTo,
        backgroundColor: ['#66673D', '#B7A73F', '#e2cf58', '#fbe769', '#fceeac', '#fef7da'],
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
                const dataArr = ctx.chart.data.datasets[1].data as number[];
                dataArr.map((data: number) => {
                  sum += data;
                });
                const percentage = ((value * 100) / sum).toFixed(1) + '%';
                return percentage;
              },
            },
          },
        },
      }
    ) : '';
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
          <figure className='graph-wrapper' style={{ backgroundColor: '#fff', height:"350px"}}>
            <Doughnut options={options} plugins={plugins} data={chartData() as ChartData<"doughnut",number[]>} aria-hidden tabIndex={0} />
            { chartData() &&
              <figcaption className={fr.cx('fr-sr-only')}>
                {datasetFrom &&
                  <>
                    <p>{'Données de répartition en prenant en compte l\'origine des trajets'}</p>
                    <ul>
                      { datasetFrom.map((d,i) =>{
                        return (
                          <li key={i}>{chartData().labels[i]} : {((d * 100) / datasetSum(datasetFrom)).toFixed(1) + '%'}</li>
                        )
                      })} 
                    </ul>
                  </> 
                }
                {datasetTo &&
                  <>
                    <p>Données de répartition en prenant en compte la destination des trajets</p>
                    <ul>
                      { datasetTo.map((d,i) =>{
                        return (
                          <li key={i}>{chartData().labels[i]} : {((d * 100) / datasetSum(datasetTo)).toFixed(1) + '%'}</li>
                        )
                      })} 
                    </ul>
                  </> 
                }
              </figcaption>
            }
          </figure>
        </div>
      )}
    </>
  );
}
