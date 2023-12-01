import AppMap from '@/components/observatoire/maps/Map';
import { Config } from '@/config';
import { LineLayer, Layer, Source, Popup } from 'react-map-gl/maplibre';
import { LngLatBoundsLike } from 'maplibre-gl';
import { cmsHost } from "@/helpers/cms";
import { useJson } from '@/hooks/useJson';
import { FeatureCollection } from 'geojson';
import { useCallback, useMemo, useState } from 'react';
//import { fr } from '@codegouvfr/react-dsfr';
import SelectInList from '@/components/common/SelectInList';

export default function VrMap({ title}: { title: string }) {
  const mapTitle = title;
  const mapStyle = Config.get<string>('observatoire.mapStyle');
  const bounds = [-5.225, 41.333, 9.55, 51.2] as LngLatBoundsLike;
  const url = `${cmsHost}/assets/897ba3a7-847e-4522-aead-7d8dd0db63c6`;
  const { data } = useJson<FeatureCollection>(url);
  const geojson = useMemo(()=>{
    return data ? data : ''
  }, [data]);
  const selectList = geojson ? geojson.features?.map((f,i) => {
    return {id:i, name:f.properties!.name}
  }): [];
  const [selected, setSelected] = useState(0);
  const onChangeSelect = useCallback((value: number) => {
    setSelected(value);
  },[]);
  const layer: LineLayer = {
    id: 'vr',
    source:'vr',
    type: 'line',
    paint: {
      'line-width': 10,  
      'line-color': '#000091',
      'line-opacity': 0.8
    },
  };
  const [cursor, setCursor] = useState<string>('');
  const [hoverInfo, setHoverInfo] = useState<{
    longitude: number,
    latitude: number,
    properties: any
  } | undefined>();
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
      <AppMap 
        title={mapTitle} 
        mapStyle={mapStyle} 
        bounds={bounds} 
        scrollZoom={false} 
        interactiveLayerIds={['vr']}
        sidebar={
          <SelectInList
            label='Sélectionner une voie'
            id={selected}
            list={selectList}
            sx={{ minWidth: 300 }}
            onChange={onChangeSelect}
          />
        }
        sidebarPosition='right'
        sidebarWidth={3}
        cursor={cursor}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Source id='vr' type='geojson' data={geojson}>
          <Layer {...layer} />
          <Popup longitude={hoverInfo ? hoverInfo.longitude : 0} latitude={hoverInfo ? hoverInfo.latitude : 0} closeButton={false}>
              {hoverInfo && 
                <div>
                  {hoverInfo.properties.name && <p><b>nom : </b>{hoverInfo.properties.name}</p>}
                </div>
              }
            </Popup>
        </Source>
      </AppMap>
    </>
  );

}