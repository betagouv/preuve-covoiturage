import AppMap from '@/components/observatoire/maps/Map';
import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { ClasseInterface, SearchParamsInterface } from '@/interfaces/observatoire/componentsInterfaces';
import type { AiresCovoiturageDataInterface } from '@/interfaces/observatoire/dataInterfaces';
import { fr } from '@codegouvfr/react-dsfr';
import bbox from '@turf/bbox';
import { feature, featureCollection } from '@turf/helpers';
import { LngLatBoundsLike } from 'maplibre-gl';
import { useCallback, useMemo, useState } from 'react';
import { CircleLayer, Layer, Popup, Source } from 'react-map-gl/maplibre';
import { SwitchFilterInterface } from '@/interfaces/observatoire/helpersInterfaces';
import { useSwitchFilters } from '@/hooks/useSwitchFilters';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';

export default function AiresCovoiturageMap({ title, params }: { title: string; params: SearchParamsInterface }) {
  const mapTitle = title;
  const apiUrl = Config.get<string>('next.public_api_url', '');
  const url = `${apiUrl}/aires-covoiturage?code=${params.code}&type=${params.type}`;
  
  const defaultFilters: SwitchFilterInterface[] = [
    {name:'Supermarché', active:true},
    {name:'Parking', active:true},
    {name:'Aire de covoiturage', active:true},
    {name:'Délaissé routier', active:true},
    {name:'Auto-stop', active:true},
    {name:'Parking relais', active:true},
    {name:'Sortie d\'autoroute', active:true},
    {name:'Autres',active:true},
  ];
  const { switchFilters, onChangeSwitchFilter } = useSwitchFilters(defaultFilters);

  const { data, error, loading } = useApi<AiresCovoiturageDataInterface[]>(url);

  const geojson = useMemo(()=>{
    const features = data ? data.map((d) =>
      feature(d.geom, { ...d, ...{ geom: undefined }}),
    ) : [];
    const activeFilters = switchFilters.filter(f => f.active === true).map(s => s.name);
    return featureCollection(features.filter(f => activeFilters.includes(f.properties.type)))
  }, [switchFilters, data]);

  const layer: CircleLayer = {
    id: 'aires',
    source:'aires',
    type: 'circle',
    paint: {
      'circle-radius': {
        'type': 'exponential',
        'stops': [
          [5, 3],
          [10,10],
          [15,15],
          [22, 50],
        ]
      },   
      'circle-color': [
      'match',
      ['get', 'type'],
      'Supermarché','#66c2a5',
      'Parking','#fc8d62',
      'Aire de covoiturage','#8da0cb',
      'Délaissé routier','#e78ac3',
      'Auto-stop','#a6d854',
      'Parking relais','#ffd92f',
      'Sortie d\'autoroute','#e5c494',
      /* other */ '#b3b3b3'
      ],
      'circle-stroke-color': 'white',
      'circle-stroke-width': 1,
      'circle-opacity': 0.8
    },
  };

  const mapStyle = Config.get<string>('observatoire.mapStyle');

  const classes: ClasseInterface[] = [
    {color:[102, 194, 165],val:'Supermarché',width:10},
    {color:[252, 141, 98],val:'Parking',width:10},
    {color:[141, 160, 203],val:'Aire de covoiturage',width:10},
    {color:[231, 138, 195],val:'Délaissé routier',width:10},
    {color:[166, 216, 84],val:'Auto-stop',width:10},
    {color:[255, 217, 47],val:'Parking relais',width:10},
    {color:[229, 196, 148],val:'Sortie d\'autoroute',width:10},
    {color:[179, 179, 179],val:'Autres',width:10}
  ];

  const bounds = useMemo(() => {
    const bounds = params.code === 'XXXXX' ? [-5.225, 41.333, 9.55, 51.2] : bbox(geojson);
    return bounds as unknown as LngLatBoundsLike;
  },[params.code, geojson]);

  const [hoverInfo, setHoverInfo] = useState<{
    longitude: number,
    latitude: number,
    properties: AiresCovoiturageDataInterface
  } | undefined>();
  const [cursor, setCursor] = useState<string>('');
  const onMouseEnter = useCallback((e:any) => {
    setCursor('pointer');
    setHoverInfo({
      longitude: e.lngLat.lng,
      latitude: e.lngLat.lat,
      properties: e.features[0].properties
    });
  }, []);
  const onMouseLeave = useCallback(() => {
    setCursor('');
    setHoverInfo(undefined);
  }, []);

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
        <AppMap 
          title={mapTitle} 
          mapStyle={mapStyle} 
          bounds={bounds} 
          scrollZoom={false} 
          legend={
            [
              {
                title:`${geojson ? geojson.features.length+1 : ''} aires de covoiturages`,
                type:'categories',
                classes: classes,
              },
            ]
          }
          sidebar={switchFilters.map((s,i) =>(
            <ul key={i} className={fr.cx('fr-toggle__list')}>
              <li>
                <ToggleSwitch 
                  className={fr.cx('fr-toggle--border-bottom')}
                  label={s.name}
                  labelPosition='left'
                  showCheckedHint={false}
                  checked={s.active}
                  onChange={checked => onChangeSwitchFilter({name: s.name, active: checked})}
                />
              </li>
            </ul>
          ))}
          sidebarPosition='right'
          sidebarWidth={3}
          interactiveLayerIds={['aires']}
          cursor={cursor}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <Source id='aires' type='geojson' data={geojson}>
            <Layer {...layer} />
            <Popup longitude={hoverInfo ? hoverInfo.longitude : 0} latitude={hoverInfo ? hoverInfo.latitude : 0} closeButton={false}>
              {hoverInfo && 
                <div>
                  {hoverInfo.properties.nom_lieu && <p><b>nom : </b>{hoverInfo.properties.nom_lieu}</p>}
                  {hoverInfo.properties.com_lieu && <p><b>commune : </b>{hoverInfo.properties.com_lieu}</p>}
                  {hoverInfo.properties.type && <p><b>type : </b>{hoverInfo.properties.type}</p>}
                  {hoverInfo.properties.nbre_pl && <p><b>Places : </b>{hoverInfo.properties.nbre_pl}</p>}
                  {hoverInfo.properties.nbre_pmr && <p><b>Places pmr : </b>{hoverInfo.properties.nbre_pmr}</p>}
                  {hoverInfo.properties.horaires && <p><b>horaires : </b>{hoverInfo.properties.horaires}</p>}
                  {hoverInfo.properties.date_maj && <p><b>Mise à jour : </b>{new Date(hoverInfo.properties.date_maj).toLocaleDateString('fr-FR')}</p>}
                </div>
              }
            </Popup>
          </Source>
        </AppMap>
      )}
    </>
  );
}