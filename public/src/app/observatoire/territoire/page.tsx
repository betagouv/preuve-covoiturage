'use client';
import { useSearchParams } from 'next/navigation';
import PageTitle from '@/components/common/PageTitle';
import SelectInList from '@/components/common/SelectInList';
import SelectObserve from '@/components/observatoire/SelectObserve';
import SelectPeriod from '@/components/observatoire/SelectPeriod';
import SelectTerritory from '@/components/observatoire/SelectTerritory';
import { getPeriod } from '@/helpers/analyse';
import { graphList, mapList } from '@/helpers/lists';
import { fr } from '@codegouvfr/react-dsfr';
import SectionTitle from '../../../components/common/SectionTitle';
import KeyFigures from './KeyFigures';
import DistanceGraph from './graphs/DistanceGraph';
import RepartitionDistanceGraph from './graphs/RepartitionDistanceGraph';
import RepartitionHoraireGraph from './graphs/RepartitionHoraireGraph';
import FluxGraph from './graphs/FluxGraph';
import OccupationGraph from './graphs/OccupationGraph';
import DensiteMap from './maps/DensiteMap';
import FluxMap from './maps/FluxMap';
import OccupationMap from './maps/OccupationMap';
import AiresCovoiturageMap from './maps/AiresMap';
import BestFluxTable from './tables/BestFluxTable';
import BestTerritoriesTable from './tables/BestTerritoriesTable';
import { useContext, useEffect } from 'react'
import { DashboardContext } from '@/context/DashboardProvider'

import { Suspense } from 'react';
import { PerimeterType } from '@/interfaces/observatoire/Perimeter';

export default function Page() {
  const searchParams = useSearchParams();
  const title = 'Comprendre le covoiturage quotidien sur votre territoire';
  const subtitle = 'Les données sont issues des plateformes de covoiturage partenaires du Registre de preuve de covoiturage et représentent environ 4% des trajets covoiturés chaque mois en 2023';
  const content = "Bien que partielle, cette source de données est à ce jour la plus complète pour comprendre certaines pratiques du covoiturage quotidien à l'échelle du territoire national."
  const { dashboard } =useContext(DashboardContext);
  const period = getPeriod(dashboard.params.year, dashboard.params.month);
  const observeLabel = dashboard.params.map == 1 ? 'Flux entre:' : 'Territoires observés';
  useEffect(() => {
    const params = {
      code: searchParams.get('code') ? searchParams.get('code')! : 'XXXXX',
      type: searchParams.get('type') ? searchParams.get('type')! as PerimeterType : 'country'
    }
    dashboard.onLoadTerritory(params);
  }, []);
    return (
    <Suspense>
      {!dashboard.loading && !dashboard.error &&(
        <div id='content'>
          <PageTitle title={title} />
          <h2 className={fr.cx('fr-h4')}>{subtitle}</h2>
          <p className={fr.cx('fr-text--lg')}>{content}</p>
          <div className={fr.cx('fr-grid-row','fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col-12','fr-col-md-6')}>
              <SelectTerritory />
            </div>
            <div className={fr.cx('fr-col-12','fr-col-md-6')}>
              <SelectPeriod />
            </div>
          </div>
          <SectionTitle
            title={`${dashboard.params.name} du ${new Date(period.start_date).toLocaleDateString()} au ${new Date(
              period.end_date,
            ).toLocaleDateString()}`}
          />
          <KeyFigures />
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col-12','fr-col-md-6')}>
              <RepartitionHoraireGraph title='Trajets par horaire' />
            </div>
            <div className={fr.cx('fr-col-12','fr-col-md-6')}>
              <RepartitionDistanceGraph title='Répartition des trajets par distance' />
            </div>
          </div>
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col-12','fr-col-md-6')}>
              <BestFluxTable title='Top 10 des trajets les plus covoiturés' limit={10} />
            </div>
            <div className={fr.cx('fr-col-12','fr-col-md-6')}>
              <BestTerritoriesTable title='Top 10 des territoires' limit={10} />
            </div>
          </div>
          <SectionTitle title='Evolution' />
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col-12')}>
              <SelectInList
                labelId='graph'
                label='Sélectionner un graphique'
                id={dashboard.params.graph}
                list={graphList}
                sx={{ minWidth: 300 }}
                onChange={dashboard.onChangeGraph}
              />
            </div>
          </div>
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col-12')}>
              {dashboard.params.graph == 1 && <FluxGraph title={graphList[0].name} indic="journeys"/>}
              {dashboard.params.graph == 2 && <DistanceGraph title={graphList[1].name} />}
              {dashboard.params.graph == 3 && <OccupationGraph title={graphList[2].name} indic="occupation_rate"/>}
              {dashboard.params.graph == 4 && <OccupationGraph title={graphList[3].name} indic="trips"/>}
            </div>
          </div>
          <SectionTitle title='Cartographie' />
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col-12','fr-col-md-6')}>
              <SelectInList
                labelId='carte'
                label='Sélectionner une carte'
                id={dashboard.params.map}
                list={dashboard.params.code=='XXXXX' ? mapList.filter( m => m.id !== 2) : mapList}
                sx={{ minWidth: 300 }}
                onChange={dashboard.onChangeMap}
              />
            </div>
            {[1,3].includes(dashboard.params.map) && 
              <div className={fr.cx('fr-col-12','fr-col-md-6')}>
                <SelectObserve id='observe' label={observeLabel} />
              </div>
            }
          </div>
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col-12')}>
              {dashboard.params.map == 1 && <FluxMap title={mapList[0].name} />}
              {dashboard.params.map == 2 && <DensiteMap title={mapList[1].name} />}
              {dashboard.params.map == 3 && <OccupationMap title={mapList[2].name} />}
              {dashboard.params.map == 4 && <AiresCovoiturageMap title={mapList[3].name} />}
            </div>
          </div>  
        </div>
      )}
    </Suspense>
  );
}
