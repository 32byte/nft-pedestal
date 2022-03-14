import { Alert, Button, Center, Container, Group, Notification, Select, SimpleGrid, Space, Text, TextInput } from "@mantine/core";
import { utils } from "ethers";
import { useEffect, useState } from "react";
import { Provider, Contract } from "zksync-web3";
const abi = require('../components/nft-abi.json');
const erc20Abi = require('../components/erc20-abi.json');
const tokens = require('../components/tokens.json');
const contracts = require('../components/contracts.json');

interface ProviderProps {
  provider: Provider
}

export default function Page(props: ProviderProps) {
  const { provider } = props;
  const [url, setUrl] = useState<string>('');
  const [fees, setFees] = useState<string>('');
  const [balance, setBalance] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);

  const contract = new Contract(
    contracts.nft.address,
    abi,
    provider.getSigner()
  );

  const usdcContract = new Contract(
    tokens.USDC.address,
    erc20Abi,
    provider.getSigner()
  );

  useEffect(() => {
    (async () => {
      // update fees
      const feeInGas = await contract.estimateGas.mintNFT(url, {
        customData: {
          feeToken: tokens.USDC.address
        }
      });
      const gasPriceInUnits = await provider.getGasPrice(tokens.USDC.address);
      setFees(utils.formatUnits(feeInGas.mul(gasPriceInUnits), tokens.USDC.decimals));

      // update balance
      const address = (await provider.send('eth_requestAccounts', []))[0];
      const balanceInUnits = await usdcContract.balanceOf(address);
      setBalance(utils.formatUnits(balanceInUnits, tokens.USDC.decimals));
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
      const txHandle = await contract.mintNFT(url, {
        customData: {
          feeToken: tokens.USDC.address
        }
      });
      
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
        <Text style={{fontSize: 18}}>Your balance: {balance} USDC</Text>
        <Group position="apart">
          <Text style={{fontSize: 18}}>Estimated fees: {fees} USDC</Text>
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