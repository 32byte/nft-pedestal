import { Group, Text } from "@mantine/core";
import Link from "next/link";

export default function NavItems() {
  return (
    <Group direction="column">
      <Link passHref href="/"><Text size="xl" weight={600} >Home</Text></Link>
      <Link passHref href="/mint"><Text size="xl" weight={600} >Mint</Text></Link>
      <Link passHref href="/promote"><Text size="xl" weight={600} >Promote</Text></Link>
    </Group>
  )
}