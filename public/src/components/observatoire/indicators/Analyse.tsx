import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import style from './Analyse.module.scss';

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
    <div className={`fr-col ${style.col}`}>
      <div className={`fr-callout ${style.analyse}`}>
        {props.title && <h3 className={`fr-callout__title ${style.title}`}>{props.title}</h3>}
        <p className={`fr-callout__text ${style.content}`}>
          {props.content}
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
        </p>
      </div>
    </div>
  );
}
