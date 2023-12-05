import { Badge } from '@codegouvfr/react-dsfr/Badge';
import style from './SingleIndicator.module.scss';
import { IndicatorProps } from '@/interfaces/observatoire/componentsInterfaces';
import { fr } from '@codegouvfr/react-dsfr';
import 'material-symbols';

export default function SingleIndicator(props: IndicatorProps) {
  return (
    <div className={`${fr.cx('fr-col-12','fr-col-md-3')} ${style.col}`}>
      <div className={`${fr.cx('fr-callout')} ${style.stat}`}>
        {props.info && <Badge severity='info'>{props.info}</Badge>}
        
        <div className={`fr-callout__title`}>
          {props.icon && <span className={`material-symbols-outlined ${style.icon}`}>{props.icon}</span>}
          <p className={`fr-h3 ${style.value}`}>{props.value} {props.unit ? props.unit : ''}</p>
        </div>
        <div className={`fr-callout__text ${style.text}`}>
          {props.text}
        </div>
      </div>
    </div>
  );
}
