'use client'
import DensiteMap from '@/app/observatoire/territoire/maps/DensiteMap';
import FluxMap from '@/app/observatoire/territoire/maps/FluxMap';
import OccupationMap from '@/app/observatoire/territoire/maps/OccupationMap';
import AiresCovoiturageMap from '@/app/observatoire/territoire/maps/AiresMap';
import { SingleMapProps } from '@/interfaces/observatoire/componentsInterfaces';

export default function SingleMap(props: SingleMapProps) {
  return(
    <>
      {props.params.map == 1 && <FluxMap title={props.title} params={props.params} />}
      {props.params.map== 2 && <DensiteMap title={props.title} params={props.params} />}
      {props.params.map == 3 && <OccupationMap title={props.title} params={props.params} />}
      {props.params.map== 4 && <AiresCovoiturageMap title={props.title} params={props.params} />}
    </>
  )
};