import { Alert, Button, Center, Container, Group, Notification, Select, SimpleGrid, Space, Text, TextInput } from "@mantine/core";
import { utils } from "ethers";
import { useEffect, useState } from "react";
import { Provider, Contract } from "zksync-web3";
const abi = require('../components/nft-abi.json');
const tokens = require('../components/tokens.json');
const contracts = require('../components/contracts.json');

interface ProviderProps {
  provider: Provider
}

export default function Page(props: ProviderProps) {
  const { provider } = props;
  const [url, setUrl] = useState<string>('');
  const [token, setToken] = useState<string|null>('ETH');
  const [fees, setFees] = useState<string>('');
  const [balance, setBalance] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);

  const contract = new Contract(
    contracts.nft.address,
    abi,
    provider.getSigner()
  );

  useEffect(() => {
    (async () => {
      if (!token) return;
      // update fees
      const address = (await provider.send('eth_requestAccounts', []))[0];
      const feeInGas = await contract.estimateGas.mintNFT(address, url, {
        customData: {
          feeToken: tokens[token].address
        }
      });
      const gasPriceInUnits = await provider.getGasPrice();
      setFees(utils.formatUnits(feeInGas.mul(gasPriceInUnits), tokens[token].decimals));

      // update balance
      const balanceInUnits = await provider.getSigner().getBalance(tokens[token].address);
      setBalance(utils.formatUnits(balanceInUnits, tokens[token].decimals));
    })()
  })

  const mint = async () => {
    if (!url || !contract) {
      setStatus({
        title: 'Error!',
        body: 'Please provide a URL',
        color: 'red'
      });
      return;
    }

    try {
      const address = (await provider.send('eth_requestAccounts', []))[0];
      const txHandle = await contract.mintNFT(address, url);
      
      setStatus({
        loading: true,
        title: 'Please wait..',
        body: 'Transaction submitted!',
        color: 'yellow'
      });
      
      const res = await txHandle.wait();
      
      const tokenId = res.events[1].args[2];
      
      setStatus({
        title: 'Success!',
        body: `You minted NFT #${tokenId}!`,
        color: 'green',
        txHash: res.transactionHash
      })
    } catch (_) {
      setStatus({
        title: 'Error!',
        body: 'Transaction denied!',
        color: 'red'
      });
    }
  }

  return (
    <Container size="xs" px="xs">
      <Center>
        <Text style={{fontSize: 32}} weight={700} variant="gradient">Mint your NFT now!</Text>
      </Center>
      <Space h="md" />
      <SimpleGrid cols={1} spacing="xs">
        <TextInput 
          value={url}
          onChange={(event) => setUrl(event.currentTarget.value)}
          placeholder="https://example.com/path/to/image.png"
          label="Image URL"
          size="md"
        />
        <Select
          value={token}
          onChange={(token) => setToken(token)}
          label="Select Token to pay fees with:"
          placeholder="ETH"
          data={[
            { value: 'ETH', label: 'ETH' },
            { value: 'USDC', label: 'USDC' },
          ]}
        />
        <Text style={{fontSize: 18}}>Your balance: {balance}{token}</Text>
        { token == "USDC" && 
        <Alert title="Warning!" color="yellow" variant="filled">
          The fee estimates for USDC are currently wrong!
        </Alert> }
        <Group position="apart">
          <Text style={{fontSize: 18}}>Estimated fees: {fees}</Text>
          <Button variant="light" color="cyan" onClick={mint}>Mint</Button>
        </Group>
        { status && (
        <Notification {...{loading: status.loading}} title={status.title} color={status.color} onClose={() => setStatus(null)}>
          <Group direction="column">
            {status.body}
            { status.txHash && <Button variant="light" color="cyan" onClick={() => navigator.clipboard.writeText(status.txHash)}>Copy hash</Button> }
          </Group>
        </Notification>)}
      </SimpleGrid>
    </Container>
  );
}