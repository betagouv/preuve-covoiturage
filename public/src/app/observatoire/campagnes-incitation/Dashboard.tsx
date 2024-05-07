'use client'
import { useSearchParams } from 'next/navigation';
import {  useMemo } from 'react';
import { PerimeterType } from '@/interfaces/observatoire/Perimeter';
import { fr } from '@codegouvfr/react-dsfr';
import SelectTerritory from '@/components/observatoire/SelectTerritory';
import IncentiveMap from './maps/IncentiveMap';
import CircularProgress from '@mui/material/CircularProgress';
import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { feature, featureCollection } from '@turf/helpers';
import { FeatureCollection } from 'geojson';
import Details from './Details';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const params = {
    code: searchParams.get('code') ? searchParams.get('code')! : 'XXXXX',
    type: searchParams.get('type') ? searchParams.get('type')! as PerimeterType : 'country'
  }
  const apiUrl = Config.get<string>('next.public_api_url', '');
  const url = `${apiUrl}/all-campaigns${params.code !== 'XXXXX' ?`?code=${params.code}&type=${params.type}`: ''}`;
  const { data, error, loading } = useApi<any[]>(url);
  const geojson = useMemo(() => {
    const campaignsData = data ? data : [];
    return featureCollection(
      campaignsData.map((d) =>
        feature(d.geom, {
          type: d.type,
          code: d.code,
          debut: d.date_debut,
          fin: d.date_fin,
          budget: d.budget_incitations,
          operateurs: d.operateurs,
        }),
      ),
    ) as FeatureCollection;
  }, [data]);

  return(
    <>
      <div className={fr.cx('fr-grid-row','fr-grid-row--gutters')}>
        <div className={fr.cx('fr-col-12','fr-col-md-6')}>
          <SelectTerritory url={'campagnes-incitation'}/>
        </div>
      </div>
      {loading ? (
        <div className={fr.cx('fr-grid-row','fr-grid-row--gutters')}>
          <div className={fr.cx('fr-mx-auto','fr-py-10w')}><CircularProgress /></div>
        </div>
      ) 
      : (
        <>
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col-12')}>
             <IncentiveMap params={params} data={geojson} loading={loading} error={error} />
            </div>
          </div>
          { params.code !== 'XXXXX' && geojson.features.length > 0 &&
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col-12')}>
             <Details data={geojson.features[0].properties} />
            </div>
          </div>
          }
        </>
      )} 
    </>
  );
}