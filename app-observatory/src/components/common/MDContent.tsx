import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

// No "user-content-" prefix on ids: keeps the #slug anchors of rehype-slug working
const schema = { ...defaultSchema, clobberPrefix: "" };

export default function MDContent(props: { source: string | undefined }) {
  if (!props.source) return null;

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, [rehypeSanitize, schema]]}>
      {props.source}
    </ReactMarkdown>
  );
}
