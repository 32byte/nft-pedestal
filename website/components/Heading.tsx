import { Button, Group, Text } from "@mantine/core";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Heading(props: any) {
  const [address, setAddress] = useState<string|null>(null);
  const { provider } = props;

  useEffect(() => {
    if (!provider) return;
    provider.send('eth_requestAccounts', [])
      .then((accounts: string[]) => {
        setAddress(accounts[0])
      })
  })

  const formatAddress = (addr: string) => {
    return addr.substring(0, 6) + '..' + addr.substring(addr.length - 4);
  }

  return (
    <Group position="apart" style={{width: '100%'}}>
      <Link href="/" passHref><Text variant="gradient" size="xl" weight={700}>NFT Pedestal</Text></Link>
      <Button variant="outline" radius="md" size="md" onClick={props.connect}>{ address ? formatAddress(address) : "connect"}</Button>
    </Group>
  )
}