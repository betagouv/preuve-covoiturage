import { Badge } from '@codegouvfr/react-dsfr/Badge';
import style from './SingleIndicator.module.scss';
import { IndicatorProps } from '@/interfaces/observatoire/componentsInterfaces';
import { fr } from '@codegouvfr/react-dsfr';
import { MDXRemote } from "next-mdx-remote/rsc";

export default function SingleIndicator(props: IndicatorProps) {
  return (
    <div className={fr.cx('fr-col','fr-col-md-3')}>
      <div className={`${fr.cx('fr-callout')} ${style.stat}`}>
        {props.info && <Badge severity='info'>{props.info}</Badge>}
        <h3 className={`fr-callout__title ${style.value}`}>{props.value} {props.unit ? props.unit : ''}</h3>
        <p className={`fr-callout__text ${style.text}`}>
          <MDXRemote source={props.text} />
        </p>
      </div>
    </div>
  );
}
