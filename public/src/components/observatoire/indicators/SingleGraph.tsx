'use client'
import TrajetsGraph from '@/app/observatoire/territoire/graphs/TrajetsGraph';
import DistanceGraph from '@/app/observatoire/territoire/graphs/DistanceGraph';
import { SingleGraphProps } from '@/interfaces/observatoire/componentsInterfaces';


export default function SingleGraph(props: SingleGraphProps) {
  return(
    <>
      {props.params.graph == 1 && <TrajetsGraph title={props.title} params={props.params} />}
      {props.params.graph== 2 && <DistanceGraph title={props.title} params={props.params} />}
    </>
  )
};