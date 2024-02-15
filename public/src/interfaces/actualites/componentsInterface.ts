export interface ActuCardProps {
  title: string,
  content: string,
  date: string,
  img: string,
  img_legend?: string,
  href: string,
  horizontal?: false | undefined,
  categories: CategorieProps[]
}

export interface CategorieProps {
  id: string | number,
  attributes:{
    label: string,
    slug: string,
  }
}