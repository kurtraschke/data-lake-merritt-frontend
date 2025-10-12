import { createFileRoute } from "@tanstack/react-router";
import { css } from "@patternfly/react-styles";
import spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";

import FaqContent from "../components/faq.mdx";

export const Route = createFileRoute("/faq")({
  component: Faq,
});

function Faq() {
  return (
    <div className={css(spacing.mx_4xl)}>
      <FaqContent />
    </div>
  );
}
