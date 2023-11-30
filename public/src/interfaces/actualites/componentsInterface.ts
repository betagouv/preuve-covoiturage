export interface ActuCardProps {
  title: string,
  content: string,
  date: string,
  img: string,
  img_legend?: string,
  href: string,
  horizontal?: boolean,
  categories: {
    Categories_id:CategorieProps
  }[]
}

export interface CategorieProps {
  id: string | number,
  name: string,
  slug: string,
}