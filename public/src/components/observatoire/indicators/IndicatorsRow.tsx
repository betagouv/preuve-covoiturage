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
        props.maps.map((i) => {
          return (
            <div className={fr.cx('fr-col')}>
              <SingleMap key={i.title} title={i.title} params={i.params} />
            </div>
          )
        }) 
      }
      {props.graphs && props.graphs.length >= 1 && 
        props.graphs.map((i) => {
          return (
            <div className={fr.cx('fr-col')}>
              <SingleGraph key={i.title} title={i.title} params={i.params} />
            </div>
          )
        }) 
      }
      
    </div>
  );
}
