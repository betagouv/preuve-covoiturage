import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import style from './Analyse.module.scss';
import { fr } from '@codegouvfr/react-dsfr';
import MDContent from "@/components/common/MDContent";

export type AnalyseProps = {
  title?: string;
  content: string;
  link?:{
    title: string;
    url: string;
  }
};
export default function SingleIndicator(props: AnalyseProps) {
  return (
    <div className={`${fr.cx('fr-col')} ${style.col}`}>
      <div className={`fr-callout ${style.analyse}`}>
        {props.title && <p className={`fr-h3 fr-callout__title ${style.title}`}>{props.title}</p>}
        <div className={`fr-callout__text ${style.content}`}>
          <MDContent source={props.content}/>
          { props.link && <ButtonsGroup
              alignment='right'
              buttonsEquisized
              buttons={[
                {
                  children: props.link.title,
                  linkProps: {
                    href: props.link.url,
                  },
                },
              ]}
            />
          }
        </div>
      </div>
    </div>
  );
}
