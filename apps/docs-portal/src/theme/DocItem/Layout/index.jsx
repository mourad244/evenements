import React from "react";
import DocItemLayout from "@theme-original/DocItem/Layout";

import DocMetaHeader from "../../../components/DocMetaHeader";

export default function DocItemLayoutWrapper(props) {
  const content = props.content || {};
  const frontMatter = content.frontMatter || {};
  const title = frontMatter.title || content.title || content.metadata?.title;
  const description =
    frontMatter.description || content.description || content.metadata?.description;

  const nextProps = {
    ...props,
    content: {
      ...content,
      frontMatter: {
        ...frontMatter,
        hide_title: true
      }
    }
  };

  return (
    <>
      <DocMetaHeader
        title={title}
        description={description}
        frontMatter={frontMatter}
        compact
      />
      <DocItemLayout {...nextProps} />
    </>
  );
}
