import DownloadButton from '@/components/observatoire/DownloadButton';
import { Config } from '@/config';
import { DashboardContext } from '@/context/DashboardProvider';
import { monthList } from '@/helpers/lists';
import { useApi } from '@/hooks/useApi';
import { EvolDistanceDataInterface } from '@/interfaces/observatoire/dataInterfaces';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function DistanceGraph({ title }: { title: string }) {
  const { dashboard } =useContext(DashboardContext);
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  const url = () => {
    const params = [
      `indic=distance`,
      `code=${dashboard.params.code}`,
      `type=${dashboard.params.type}`,
      `year=${dashboard.params.year}`
    ]
    switch(dashboard.params.period){
      case 'month':
      params.push( `month=${dashboard.params.month}`);
      break;
      case 'trimester':
      params.push( `trimester=${dashboard.params.trimester}`);
      break;
      case 'semester':
      params.push( `semester=${dashboard.params.semester}`);
      break;
    }
    return `${apiUrl}/evol-flux?${params.join('&')}`
  };
  const apiUrl = Config.get<string>('next.public_api_url', '');
  const { data, error, loading } = useApi<EvolDistanceDataInterface[]>(url());
  const dataset = data?.map((d) => d.distance/d.journeys).reverse();

  const chartData = () => {
    const labels = data?.map((d) => {
      const month = monthList.find((m) => m.id == d.month);
      return month!.name + ' ' + d.year;
    });
    const datasets = [
      {
        data: dataset,
        fill: true,
        borderColor: '#000091',
        backgroundColor: 'rgba(0, 0, 145, 0.2)',
        tension: 0.1,
      },
    ];
    return { labels: labels!.reverse(), datasets: datasets };
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
                filename='distance'
              />
            </span>
          </div>
          <figure className='graph-wrapper' style={{ backgroundColor: '#fff' }}>
            <Line options={options} data={chartData()} aria-hidden />
            { dataset &&
              <figcaption className={fr.cx('fr-sr-only')}>
                <ul>
                  { dataset.map((d,i) =>{
                    return (
                      <li key={i}>{chartData().labels[i]} : {d.toLocaleString('fr-FR',{maximumFractionDigits:2})} km</li>
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
