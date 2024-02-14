'use client'
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { CategorieProps } from "@/interfaces/actualites/componentsInterface";
import { fr } from "@codegouvfr/react-dsfr";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CategoryTags(props: {categories: CategorieProps[], active?:string}) {  
  const router = useRouter();
  const [active, setActive] = useState<string | null>(props.active ? props.active : null);
  useEffect(()=>{
    active ? router.push(`/actualites/categorie/${active}`) : undefined
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
                    t.attributes.slug === active ? setActive(null) : setActive(t.attributes.slug)
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