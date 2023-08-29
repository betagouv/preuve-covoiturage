'use client';
import { MapboxOverlay, MapboxOverlayProps } from '@deck.gl/mapbox/typed';
import { Map, useControl, NavigationControl, FullscreenControl, MapRef } from 'react-map-gl/maplibre';
import Legend from './Legend';
import { DeckMapInterface } from '@/interfaces/observatoire/componentsInterfaces';
//css
import 'maplibre-gl/dist/maplibre-gl.css';
import { useRef, useEffect } from 'react';

function DeckGLOverlay(
  props: MapboxOverlayProps & {
    interleaved?: boolean;
  },
) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

const DeckMap = (props: DeckMapInterface) => {
  const mapRef = useRef<MapRef>(null);
  const defaultView = {
    latitude: 46.9,
    longitude: 1.7,
    zoom: 5,
  };
  const fitBounds = () => {
    if (props.bounds) mapRef.current?.fitBounds(props.bounds, { padding: 20 }) ;
  };
  useEffect(() => {
    if (props.bounds) mapRef.current?.fitBounds(props.bounds, { padding: 20 }) ;
  }, [props.bounds]);

  return (
    <div className='fr-callout'>
      <h3 className='fr-callout__title'>{props.title}</h3>
      <Map
        ref={mapRef}
        initialViewState={props.initialView ? props.initialView : defaultView}
        style={{
          width: props.width ? props.width : '100%',
          height: props.height ? props.height : '60vh',
        }}
        mapStyle={props.mapStyle}
        onLoad={fitBounds}
        scrollZoom={props.scrollZoom}
      >
        <DeckGLOverlay layers={props.layers} getTooltip={props.tooltip} />
        <NavigationControl />
        <FullscreenControl />
        {props.legend &&
          props.legend.map((l,i) =>
            <Legend key={i} title={l.title} type={l.type} classes={l.classes} order={l.order} />
          )
        }
      </Map>
    </div>
  );
};

export default DeckMap;
