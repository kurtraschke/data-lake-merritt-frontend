import {
  Button,
  CodeBlock,
  CodeBlockCode,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateStatus,
} from "@patternfly/react-core";
import { type ErrorRouteComponent, useRouter } from "@tanstack/react-router";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useEffect } from "react";

const ErrorComponent: ErrorRouteComponent = ({ error }) => {
  const router = useRouter();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();

  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);

  return (
    <EmptyState
      status={EmptyStateStatus.warning}
      titleText={"Error"}
      headingLevel="h4"
    >
      <EmptyStateBody>
        <Content component={ContentVariants.p} isEditorial>
          An error has occurred. Additional information may be available in the
          browser's developer console.
        </Content>

        <Content component={ContentVariants.p} isEditorial>
          It may be possible to try again by clicking below.
        </Content>

        <Content component={ContentVariants.p}>Error details:</Content>

        <CodeBlock>
          <CodeBlockCode>{error.message}</CodeBlockCode>
        </CodeBlock>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            variant="primary"
            onClick={() => {
              void router.invalidate();
            }}
          >
            Try again
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default ErrorComponent;
