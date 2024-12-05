import React from "react";
import markdownit from "markdown-it";
import DOMPurify from 'dompurify';

type Props = {
  text: string;
};

const md = markdownit({
});

const Markdown = ({ text }: Props) => {
  const htmlcontent = md.render(text);
  const purifiedHtml = DOMPurify.sanitize(htmlcontent);
  return <div dangerouslySetInnerHTML={{ __html: purifiedHtml }}></div>;
};

export default Markdown;