import DownloadButton from '@/components/observatoire/DownloadButton';
import { DashboardContext } from '@/context/DashboardProvider';
import { useApi } from '@/hooks/useApi';
import { FluxIndicators } from '@/interfaces/observatoire/componentsInterfaces';
import { fr } from '@codegouvfr/react-dsfr';
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
import { useContext } from 'react';
import { Line } from 'react-chartjs-2';
import { GetApiUrl } from '../../../../helpers/api';
import { chartLabels } from '../../../../helpers/graph';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function TrajetsGraph({ title,indic }: { title: string, indic:FluxIndicators }) {
  const { dashboard } =useContext(DashboardContext);
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  const params = [
    `indic=${indic}`,
    `code=${dashboard.params.code}`,
    `type=${dashboard.params.type}`,
    `year=${dashboard.params.year}`
  ];
  const url = GetApiUrl('evol-flux', params);
  const { data, error, loading } = useApi<Record<string, number>[]>(url);
  const dataset = data?.map((d) => d[`${indic}`]).reverse();
  const datasets = [
    {
      data: dataset,
      fill: true,
      borderColor: '#000091',
      backgroundColor: 'rgba(0, 0, 145, 0.2)',
      tension: 0.1,
    },
  ];
  const chartData = { labels: chartLabels(data ? data : [] , dashboard.params.period) , datasets: datasets };
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
      {!data || data.length == 0 && (
        <div className={fr.cx('fr-callout')}>
          <h3 className={fr.cx('fr-callout__title')}>{title}</h3>
          <div>Pas de données disponibles pour ce graphique...</div>
        </div>
      )}
      {!loading && !error && data && data.length > 0 && (
        <div className={fr.cx('fr-callout')}>
          <div className={fr.cx('fr-callout__title','fr-text--xl')}>
            {title}  
            <span className={fr.cx('fr-pl-5v')}>
              <DownloadButton 
                title={'Télécharger les données du graphique'}
                data={data!}
                filename='flux'
              />
            </span>
          </div>
          <figure className='graph-wrapper' style={{ backgroundColor: '#fff' }}>
            <Line options={options} data={chartData} aria-hidden />
            { dataset &&
              <figcaption className={fr.cx('fr-sr-only')}>
                <ul>
                  { dataset.map((d,i) =>{
                    return (
                      <li key={i}>{chartData.labels[i]} : {d} trajets</li>
                    )
                  })} 
                </ul> 
              </figcaption>
            }
          </figure> 
        </div>
      )}
    </>
  );
}
