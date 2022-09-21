import { FC } from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

const RenderMarkdown: FC<{ mdString: string }> = ({ mdString }) => {
  return (
    <ReactMarkdown remarkPlugins={[gfm]}>
      {mdString || "This update has no description :("}
    </ReactMarkdown>
  );
};
export default RenderMarkdown;
