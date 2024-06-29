import React from "react";
import "../../assets/css/MarkdownRenderer.css";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="markdown-content-renderer">
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
};

export default MarkdownRenderer;
