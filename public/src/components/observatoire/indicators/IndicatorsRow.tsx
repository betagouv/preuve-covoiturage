import { fr } from '@codegouvfr/react-dsfr';
import SingleIndicator from './SingleIndicator';
import Analyse from './Analyse';
import { IndicatorsRowProps } from '@/interfaces/observatoire/componentsInterfaces';
import SingleMap from './SingleMap';


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
      {props.map &&
        <SingleMap title={props.map.title} params={props.map.params} /> 
      }
    </div>
  );
}
