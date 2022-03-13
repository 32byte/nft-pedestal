import { AppShell, Burger, Button, Group, Header, MediaQuery, Navbar, Text, useMantineTheme } from "@mantine/core";
import { useState } from "react";
import NavItems from "./NavItems";
import Heading from "./Heading";

export default function AppWrap(props: any) {
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();

  return (
    <AppShell
      navbarOffsetBreakpoint="sm"
      fixed
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 200 }}
        >
          <NavItems />
        </Navbar>
      }
      header={
        <Header height={70} p="md">
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>

            <Heading connect={props.connect} provider={props.provider}/>
          </div>
        </Header>
      }
    >
      {props.app}
    </AppShell>
  );
}