import {
  createRootRoute,
  Link,
  linkOptions,
  Outlet,
  useMatches,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  Nav,
  NavItem,
  NavList,
  Page,
  PageSection,
} from "@patternfly/react-core";
import { css } from "@patternfly/react-styles";
import navStyles from "@patternfly/react-styles/css/components/Nav/nav";
import textStyles from "@patternfly/react-styles/css/utilities/Text/text";

import "@patternfly/react-core/dist/styles/base.css";
import "../app.css";

export const Route = createRootRoute({
  component: RouteComponent,
});

function RouteComponent() {
  const isFullPage = useMatches({
    select: (matches) => {
      return matches.slice(-1)[0].staticData.fullPage ?? false;
    },
  });

  const options = linkOptions([
    {
      to: "/stringline",
      label: "Stringlines",
    },
    {
      to: "/faq",
      label: "FAQ",
    },
  ]);

  const masthead = (
    <Masthead inset={{ default: "insetLg" }}>
      <MastheadMain>
        <MastheadBrand>
          <span className={css(textStyles.fontSizeXl)}>Data Lake Merritt</span>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <Nav variant="horizontal">
          <NavList>
            {options.map((option) => (
              <NavItem
                key={option.to}
                to={option.to}
                component={(props) => {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  const { href: to, ...linkProps } = props;
                  return (
                    <Link
                      to={to as string}
                      {...linkProps}
                      activeProps={{
                        className: css(navStyles.modifiers.current),
                      }}
                    />
                  );
                }}
              >
                {option.label}
              </NavItem>
            ))}
          </NavList>
        </Nav>
      </MastheadContent>
    </Masthead>
  );

  return (
    <>
      <Page
        isContentFilled={isFullPage}
        masthead={masthead}
        className={css(isFullPage && "fullPage")}
      >
        <PageSection isFilled={isFullPage}>
          <Outlet />
        </PageSection>
      </Page>
      <TanStackRouterDevtools />
    </>
  );
}
