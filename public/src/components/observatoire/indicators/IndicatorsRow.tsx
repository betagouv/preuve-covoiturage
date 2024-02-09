import { fr } from '@codegouvfr/react-dsfr';
import Indicator from './Indicator';
import Analyse from './Analyse';
import { IndicatorsRowProps } from '@/interfaces/observatoire/componentsInterfaces';
import Map from './Map';
import Graph from './Graph';


export default function IndicatorsRow(props: IndicatorsRowProps) {
  return (
    <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
      {props.indicators && props.indicators.length >= 1 &&
        props.indicators.map((v, i) => {
          return <Indicator key={i} value={v.value} unit={v.unit} info={v.info} text={v.text} icon={v.icon} />;
        })
      }
      {props.analyses && props.analyses.length >= 1 && 
        props.analyses.map((v, i) => {
          return <Analyse key={i} title={v.title} content={v.content} link={v.link} />;
        })
      }
      {props.maps && props.maps.length >= 1 && 
        props.maps.map((m, i) => {
          return (
            <div key={i} className={fr.cx('fr-col')}>
              <Map title={m.title} params={m.params} />
            </div>
          )
        }) 
      }
      {props.graphs && props.graphs.length >= 1 && 
        props.graphs.map((g, i) => {
          return (
            <div key={i} className={fr.cx('fr-col')}>
              <Graph title={g.title} params={g.params} />
            </div>
          )
        }) 
      }
    </div>
  );
}
