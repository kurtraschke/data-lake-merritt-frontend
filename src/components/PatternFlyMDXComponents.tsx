import type { MDXComponents } from "mdx/types";
import {
  Button,
  Content,
  ContentVariants,
  Divider,
} from "@patternfly/react-core";
import { Link } from "@tanstack/react-router";

export const components: MDXComponents = {
  p: (properties) => {
    return (
      <Content component={ContentVariants.p} isEditorial {...properties} />
    );
  },
  h1: (properties) => {
    return (
      <Content component={ContentVariants.h1} isEditorial {...properties} />
    );
  },
  h2: (properties) => {
    return (
      <Content component={ContentVariants.h2} isEditorial {...properties} />
    );
  },
  h3: (properties) => {
    return (
      <Content component={ContentVariants.h3} isEditorial {...properties} />
    );
  },
  h4: (properties) => {
    return (
      <Content component={ContentVariants.h4} isEditorial {...properties} />
    );
  },
  h5: (properties) => {
    return (
      <Content component={ContentVariants.h5} isEditorial {...properties} />
    );
  },
  h6: (properties) => {
    return (
      <Content component={ContentVariants.h6} isEditorial {...properties} />
    );
  },
  hr: (properties) => {
    return <Divider {...properties} />;
  },
  ul: (properties) => {
    return <Content component={ContentVariants.ul} {...properties} />;
  },
  ol: (properties) => {
    return <Content component={ContentVariants.ol} {...properties} />;
  },
  li: (properties) => {
    return <Content component={ContentVariants.li} {...properties} />;
  },
  blockquote: (properties) => {
    return <Content component={ContentVariants.blockquote} {...properties} />;
  },
  a: (properties) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
    const isExternal =
      properties.href != undefined && URL.canParse(properties.href);

    return (
      <Button
        variant="link"
        isInline
        component={(props) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const { href: to, ...linkProps } = props;
          return (
            <Link
              {...linkProps}
              to={to as string}
              target={isExternal ? "_blank" : undefined}
            />
          );
        }}
        {...properties}
      />
    );
  },
};
