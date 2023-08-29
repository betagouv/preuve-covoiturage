'use client'
import { fr } from '@codegouvfr/react-dsfr';
import dynamic from 'next/dynamic';
import { SearchParamsInterface } from '@/interfaces/observatoire/componentsInterfaces';
import PageTitle from '@/components/common/PageTitle';
import SelectTerritory from '@/components/observatoire/SelectTerritory';
import SelectPeriod from '@/components/observatoire/SelectPeriod';
import KeyFigures from './KeyFigures';
import RepartitionDistanceGraph from './graphs/RepartitionDistanceGraph';
import RepartitionHoraireGraph from './graphs/RepartitionHoraireGraph';
import BestFluxTable from './tables/BestFluxTable';
import BestTerritoriesTable from './tables/BestTerritoriesTable';
import { mapList, graphList } from '@/helpers/lists';
import SelectInList from '@/components/common/SelectInList';
import OccupationMap from './maps/OccupationMap';
const SectionTitle = dynamic(() => import('@/components/common/SectionTitle'), {
  ssr: false,
});
const FluxMap = dynamic(() => import('./maps/FluxMap'), {
  ssr: false,
});
const DensiteMap = dynamic(() => import('./maps/DensiteMap'), {
  ssr: false,
});
import TrajetsGraph from './graphs/TrajetsGraph';
import DistanceGraph from './graphs/DistanceGraph';
import { useDashboard } from '@/hooks/useDashboard';
import { getPeriod } from '@/helpers/analyse';
import SelectObserve from '@/components/observatoire/SelectObserve';

export default function Page({ searchParams }: { searchParams: SearchParamsInterface }) {
  const title = 'Observer le covoiturage courte distance intermédié';
  const { params, error, loading, onChangeTerritory, onChangePeriod, onChangeObserve, onChangeGraph, onChangeMap } = useDashboard(searchParams);
  const period = getPeriod(params.year, params.month);
  const observeLabel = params.map == 1 ? 'Flux entre:' : 'Territoires observés';

  return (
    <>
      {!loading && !error &&(
        <article id='content'>
          <PageTitle title={title} />
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col')}>
              <SelectTerritory code={params.code} type={params.observe} year={params.year} onChange={onChangeTerritory} />
            </div>
            <div className={fr.cx('fr-col')}>
              <SelectPeriod year={params.year} month={params.month} onChange={onChangePeriod} />
            </div>
          </div>
          <SectionTitle
            title={`${params.name} du ${new Date(period.start_date).toLocaleDateString()} au ${new Date(
              period.end_date,
            ).toLocaleDateString()}`}
          />
          <KeyFigures params={params} />
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col','fr-col-md-6')}>
              <RepartitionDistanceGraph title='Trajets par distance' direction='from' params={params} />
            </div>
          </div>
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col')}>
              <RepartitionHoraireGraph title='Trajets sortants par horaire' direction='from' params={params} />
            </div>
            <div className={fr.cx('fr-col')}>
              <RepartitionHoraireGraph title='Trajets entrants par horaire' direction='to' params={params} />
            </div>
          </div>
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col')}>
              <BestFluxTable title='Top 10 des trajets les plus covoiturés' limit={10} params={params} />
            </div>
            <div className={fr.cx('fr-col')}>
              <BestTerritoriesTable title='Top 10 des territoires' limit={10} params={params} />
            </div>
          </div>
          <SectionTitle title='Cartographie' />
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col')}>
              <SelectInList
                label='Sélectionner une carte'
                id={params.map}
                list={mapList}
                sx={{ minWidth: 300 }}
                onChange={onChangeMap}
              />
            </div>
            {[1,3].includes(params.map) && 
              <div className={fr.cx('fr-col')}>
                <SelectObserve label={observeLabel} type={params.type} value={params.observe} onChange={onChangeObserve} />
              </div>
            }
          </div>
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col')}>
              {params.map == 1 && <FluxMap title={mapList[0].name} params={params} />}
              {params.map == 2 && <DensiteMap title={mapList[1].name} params={params} />}
              {params.map == 3 && <OccupationMap title={mapList[2].name} params={params} />}
            </div>
          </div>
          <SectionTitle title='Evolution' />
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col')}>
              <SelectInList
                label='Sélectionner un graphique'
                id={params.graph}
                list={graphList}
                sx={{ minWidth: 300 }}
                onChange={onChangeGraph}
              />
            </div>
          </div>
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            {params.graph == 1 && (
              <div className={fr.cx('fr-col')}>
                <TrajetsGraph title={graphList[0].name} params={params} />
              </div>
            )}
            {params.graph == 2 && (
              <div className={fr.cx('fr-col')}>
                <DistanceGraph title={graphList[1].name} params={params} />
              </div>
            )}
          </div>
        </article>
      )}
    </>
  );
}
