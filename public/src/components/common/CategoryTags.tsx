'use client'
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { CategorieProps } from "@/interfaces/actualites/componentsInterface";
import { fr } from "@codegouvfr/react-dsfr";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CategoryTags(props: {categories: CategorieProps[], active?:string, type?: 'actualites' | 'ressources', page?: string}) {  
  const router = useRouter();
  const [active, setActive] = useState<string | null>(props.active ? props.active : null);
  const [page, setPage] = useState<string | null>(props.page ? props.page : null);
  useEffect(()=>{
    active ? router.push(`/${props.type ? props.type : 'actualites'}/categorie/${active}${page ? `/page/${page}`: ''}`) : router.push(`/${props.type ? props.type : 'actualites'}${page ? `/page/${page}`: ''}`)
  })
  return (
    <ul className={fr.cx('fr-tags-group')}>
      {props.categories &&
        props.categories.map((t) => {
          return (
            <li key={t.id}>
              <Tag
                nativeButtonProps={{
                  onClick: () => {
                     if(t.attributes.slug === active){ 
                      setActive(null)
                      } else {
                      setActive(t.attributes.slug)
                      setPage(null)
                    }
                  }
                }}
                pressed={ t.attributes.slug === active ? true : false}
              >
                {t.attributes.label}
              </Tag>
            </li>
          )
        })
      }
    </ul>
  )
}