import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { VFileCompatible } from 'vfile';



export default function MDContent(props:{ source:VFileCompatible }) {
  const options = {
    mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [],
    }
  }
	return (
    <MDXRemote source={props.source} options={options} />
  ); 
}