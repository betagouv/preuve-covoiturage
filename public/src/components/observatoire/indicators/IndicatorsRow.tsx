import { fr } from '@codegouvfr/react-dsfr';
import SingleIndicator from './SingleIndicator';
import Analyse from './Analyse';

type IndicatorsRowProps = {
  indicators: {
    value: string;
    info?: string;
    title: string;
  }[];
  analyse?: {
    title?: string;
    content: string;
    link?:{
      title: string;
      url: string;
    }
  };
};
export default function IndicatorsRow(props: IndicatorsRowProps) {
  return (
    <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
      {props.indicators.length > 0 &&
        props.indicators.map((i) => {
          return <SingleIndicator key={i.value} value={i.value} info={i.info} title={i.title} style='fr-col-md-3' />;
        })}
      {props.analyse && <Analyse title={props.analyse.title} content={props.analyse.content} link={props.analyse.link} />}
    </div>
  );
}
