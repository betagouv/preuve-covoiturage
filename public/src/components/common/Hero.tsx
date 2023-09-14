'use client'
import { ButtonsGroup } from '@codegouvfr/react-dsfr/ButtonsGroup';
import { fr } from '@codegouvfr/react-dsfr';
import { useColors } from "@codegouvfr/react-dsfr/useColors";
import { ButtonProps } from '@codegouvfr/react-dsfr/Button';
import { CSSProperties } from 'react';
import Image from 'next/image';
import { HeroProps } from '@/interfaces/common/componentsInterface';
import { cmsHost } from '@/helpers/cms';

export default function Hero(props:HeroProps) {
  const theme = useColors();
  return (
    <div id='hero' 
      className={fr.cx('fr-grid-row', 'fr-p-2w', 'fr-p-md-10w','fr-mt-5w')}
      style={props.backgroundColor && !theme.isDark 
        ? {"backgroundColor": props.backgroundColor} as CSSProperties 
        : theme.isDark ? {"backgroundColor": "#272747"} as CSSProperties : undefined
      }
    >
      <div className={fr.cx('fr-col-12', 'fr-col-md-9')}>
        <p className={fr.cx('fr-h1','fr-mb-2v')}>{props.title}</p>
        {props.subtitle && <p className={fr.cx('fr-h6')}>{props.subtitle}</p>}
        <p className={fr.cx('fr-pr-md-5v')}>{props.content}</p>
        {props.buttons && props.img && 
          <div className={fr.cx('fr-pr-md-5v')}>
            <ButtonsGroup
              alignment={'right'}
              buttons={props.buttons.map(b => {
                return {
                  children:b.title,
                  linkProps: {
                    href: b.url
                  },
                  iconId: b.icon ? b.icon : '',
                  priority: b.color ? b.color : 'primary',
                } 
              }) as [ButtonProps, ...ButtonProps[]]}
              buttonsEquisized
              buttonsIconPosition={'right'}
            />
          </div>
        }
      </div>
      <div className={fr.cx('fr-col', 'fr-col-md-3','fr-my-auto')}>
        {props.img &&
          <figure className={fr.cx('fr-content-media')} role="group">
            <div className={fr.cx('fr-content-media__img')}>
              <Image className={fr.cx('fr-responsive-img','fr-responsive-img--16x9')} src={`${cmsHost}/assets/${props.img}`} alt={props.alt ? props.alt : ''} width={1200} height={800} />
            </div>
          </figure>
        }
        {props.buttons && !props.img && 
          <ButtonsGroup
            alignment={'center'}
            buttons={props.buttons.map(b => {
              return {
                children:b.title,
                linkProps: {
                  href: b.url
                },
                iconId: b.icon ? b.icon : '',
                priority: b.color ? b.color : 'primary',
              } 
            }) as [ButtonProps, ...ButtonProps[]]}
          />
        }
      </div>
    </div>
  );
}