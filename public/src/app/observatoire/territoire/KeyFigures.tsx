import Rows from '@/components/observatoire/indicators/Rows';
import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { IndicatorProps } from '@/interfaces/observatoire/componentsInterfaces';
import { KeyFiguresDataInterface } from '@/interfaces/observatoire/dataInterfaces';
import { fr } from '@codegouvfr/react-dsfr';
import { useDashboardContext } from '../../../context/DashboardProvider';

export default function KeyFigures() {
  const { dashboard } = useDashboardContext();
  const apiUrl = Config.get<string>('next.public_api_url', '');
  const url = () => {
    const params = [
      `code=${dashboard.params.code}`,
      `type=${dashboard.params.type}`,
      `year=${dashboard.params.year}`,
      `direction=both`
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
    return `${apiUrl}/keyfigures?${params.join('&')}`
  };
  const { data, error, loading } = useApi<KeyFiguresDataInterface[]>(url());
  const row1 = (data && data.length > 0)
    ? [
        { __component: 'row.indicator',
          value: data[0].journeys.toLocaleString(),
          text: 'Covoiturages réalisés',
          icon:'ri-car-line',
        },
        { __component: 'row.indicator',
          value: `${data[0].occupation_rate.toLocaleString()}`,
          text: "personnes par véhicule",
          icon:'ri-group-2-line',
        },
        { __component: 'row.indicator',
          value: `${data[0].new_drivers.toLocaleString()}`, 
          text: 'Primo conducteurs',
          icon: 'ri-steering-2-line'
        },
        { __component: 'row.indicator',
          value: `${data[0].new_passengers.toLocaleString()}`, 
          text: 'Primo passagers',
          icon: 'ri-user-add-line'
        },
      ] as IndicatorProps[]
    : [];

  const row2 = (data && data.length > 0)
    ? [
        { __component: 'row.indicator',
          value: `${Math.round(data[0].distance / data[0].passengers).toLocaleString()}`,
          unit:'km',
          text: 'Distance moyenne',
          icon:'ri-signpost-line'
        },
        { __component: 'row.indicator',
          value: `${Math.round(data[0].duration / data[0].passengers).toLocaleString()}`,
          unit:'min',
          text: 'Temps moyen des trajets',
          icon:'ri-time-line'
        },
        { __component: 'row.indicator',
          value: `${((data[0].intra_journeys / data[0].journeys) * 100).toLocaleString('fr-FR', {
            maximumFractionDigits: 1,
          })}`,
          unit:'%',
          text: 'Trajets réalisés à l\'intérieur du territoire',
          icon:'ri-focus-line',
        },
        { __component: 'row.indicator',
          value: Math.round(data[0].distance * 0.000195).toLocaleString(), 
          text: 'Tonnes de CO₂ économisés',
          icon: 'ri-haze-line'
        },
        
      ] as IndicatorProps[]
    : [];

  return (
    <>
    {loading && (
      <div className={fr.cx('fr-callout')}>
        <div>Chargement en cours...</div>
      </div>
    )}
    {error && (
      <div className={fr.cx('fr-callout')}>
        <div>{`Un problème est survenu au chargement des données: ${error}`}</div>
      </div>
    )}
    {!data || data.length == 0 && (
      <div className={fr.cx('fr-callout')}>
        <div>Pas de données disponibles...</div>
      </div>
    )}
    {!loading && !error && data && data.length > 0 && (
      <>
        <Rows data={row1} />
        <Rows data={row2} />
      </>
    )}
  </>
  );
}
