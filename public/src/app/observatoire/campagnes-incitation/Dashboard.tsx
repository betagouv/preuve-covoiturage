'use client'
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect } from 'react';
import { DashboardContext } from '@/context/DashboardProvider';
import { getPeriod } from '@/helpers/analyse';
import { PerimeterType } from '@/interfaces/observatoire/Perimeter';
import { fr } from '@codegouvfr/react-dsfr';
import SelectTerritory from '@/components/observatoire/SelectTerritory';
import SelectPeriod from '@/components/observatoire/SelectPeriod';
import SectionTitle from '@/components/common/SectionTitle';
import SelectObserve from '@/components/observatoire/SelectObserve';
import SelectInList from '@/components/common/SelectInList';
import IncentiveMap from './maps/IncentiveMap';
import CircularProgress from '@mui/material/CircularProgress';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const { dashboard } =useContext(DashboardContext);
  const period = getPeriod(dashboard.params.year, dashboard.params.month);
  const observeLabel = dashboard.params.map == 1 ? 'Flux entre:' : 'Territoires observés';
  useEffect(() => {
    const params = {
      code: searchParams.get('code') ? searchParams.get('code')! : 'XXXXX',
      type: searchParams.get('type') ? searchParams.get('type')! as PerimeterType : 'country'
    }
    dashboard.onLoadTerritory(params);
  }, [searchParams]);

  return(
    <>
      <div className={fr.cx('fr-grid-row','fr-grid-row--gutters')}>
        <div className={fr.cx('fr-col-12','fr-col-md-6')}>
          <SelectTerritory />
        </div>
        <div className={fr.cx('fr-col-12','fr-col-md-6')}>
          <SelectPeriod />
        </div>
      </div>
      {dashboard.loading ? (
        <div className={fr.cx('fr-grid-row','fr-grid-row--gutters')}>
          <div className={fr.cx('fr-mx-auto','fr-py-10w')}><CircularProgress /></div>
        </div>
      ) 
      : (
        <>
          <SectionTitle
            title={`${dashboard.params.name} du ${new Date(period.start_date).toLocaleDateString()} au ${new Date(
              period.end_date,
            ).toLocaleDateString()}`}
          />
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col-12')}>
             <IncentiveMap title={''} />
            </div>
          </div>
        </>
      )} 
    </>
  );
}