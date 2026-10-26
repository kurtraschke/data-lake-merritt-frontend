import { css } from "@patternfly/react-styles";
import spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";

import FaqContent from "./pages/faq.mdx";
import React from "react";

const FaqComponent: React.FunctionComponent = () => (
  <div className={css(spacing.mx_4xl)}>
    <FaqContent />
  </div>
);

export default FaqComponent;
