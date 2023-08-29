import { Badge } from '@codegouvfr/react-dsfr/Badge';
import style from './SingleIndicator.module.scss';

export type SingleIndicatorProps = {
  value: string;
  info?: string;
  title: string;
  style?: string;
};
export default function SingleIndicator(props: SingleIndicatorProps) {
  return (
    <div className={`fr-col ${props.style} ${style.col}`}>
      <div className={`fr-callout ${style.stat}`}>
        {props.info && <Badge severity='info'>{props.info}</Badge>}
        <h3 className={`fr-callout__title ${style.value}`}>{props.value}</h3>
        <p className={`fr-callout__text ${style.title}`}>{props.title}</p>
      </div>
    </div>
  );
}
