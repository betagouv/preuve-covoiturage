import { fr } from '@codegouvfr/react-dsfr';
import SingleIndicator from './SingleIndicator';
import Analyse from './Analyse';
import { IndicatorsRowProps } from '@/interfaces/observatoire/componentsInterfaces';
import SingleMap from './SingleMap';
import SingleGraph from './SingleGraph';


export default function IndicatorsRow(props: IndicatorsRowProps) {
  return (
    <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
      {props.indicators && props.indicators.length >= 1 &&
        props.indicators.map((i) => {
          return <SingleIndicator key={i.value} value={i.value} unit={i.unit} info={i.info} text={i.text} icon={i.icon} />;
        })
      }
      {props.analyses && props.analyses.length >= 1 && 
        props.analyses.map((i) => {
          return <Analyse key={i.title} title={i.title} content={i.content} link={i.link} />;
        })
      }
      {props.maps && props.maps.length >= 1 && 
        props.maps.map((m, i) => {
          return (
            <div key={i} className={fr.cx('fr-col')}>
              <SingleMap title={m.title} params={m.params} />
            </div>
          )
        }) 
      }
      {props.graphs && props.graphs.length >= 1 && 
        props.graphs.map((g, i) => {
          return (
            <div key={i} className={fr.cx('fr-col')}>
              <SingleGraph title={g.title} params={g.params} />
            </div>
          )
        }) 
      }
      
    </div>
  );
}
