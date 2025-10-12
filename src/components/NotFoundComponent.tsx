import {
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateBody,
  EmptyStateStatus,
} from "@patternfly/react-core";
import { type NotFoundRouteComponent } from "@tanstack/react-router";

const NotFoundComponent: NotFoundRouteComponent = () => {
  return (
    <EmptyState
      status={EmptyStateStatus.info}
      titleText={"Not Found"}
      headingLevel="h4"
    >
      <EmptyStateBody>
        <Content component={ContentVariants.p} isEditorial>
          The requested content was not found.
        </Content>
      </EmptyStateBody>
    </EmptyState>
  );
};

export default NotFoundComponent;
