import { Alert, Button, Center, Container, Group, Notification, NumberInput, Select, SimpleGrid, Space, Text, TextInput } from "@mantine/core";
import { BigNumber, utils } from "ethers";
import { useEffect, useState } from "react";
import { Provider, Contract, utils as zkutils } from "zksync-web3";

const abi = require('../components/bidder-abi.json');
const erc20Abi = require('../components/erc20-abi.json');
const tokens = require('../components/tokens.json');
const contracts = require('../components/contracts.json');

interface ProviderProps {
  provider: Provider
}


export default function Page(props: ProviderProps) {
  const { provider } = props;
  const [bid, setBid] = useState<BigNumber|undefined>(BigNumber.from(0));
  const [tokenId, setTokenId] = useState<number|undefined>(0);
  const [balance, setBalance] = useState<string|undefined>();
  const [allowance, setAllowance] = useState<BigNumber|undefined>();
  const [status, setStatus] = useState<any>(null);
  const [highestBid, setHighestBid] = useState<string|undefined>();

  const contract = new Contract(
    contracts.bidder.address,
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
      // update balance
      if(!balance) {
        const address = (await provider.send('eth_requestAccounts', []))[0];
        const balanceInUnits = await usdcContract.balanceOf(address);
        setBalance(utils.formatUnits(balanceInUnits, tokens.USDC.decimals));
      }

      // update allowance
      if (!allowance) {
        const address = (await provider.send('eth_requestAccounts', []))[0];
        const allowanceInUnits = await usdcContract.allowance(address, contracts.bidder.address);
        setAllowance(BigNumber.from(allowanceInUnits));
      }

      // update highest bid
      if (!highestBid) {
        const highestBid = await contract.highestBid();
        setHighestBid(highestBid.toString());
      }
    })()
  })

  const approve = async () => {
    const txHandle = await usdcContract.approve(contracts.bidder.address, bid, {
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

    let res = await txHandle.wait();

    setStatus({
      title: 'Success!',
      body: `Updated allowance!`,
      color: 'green',
      txHash: res.transactionHash
    });

    // reset so it gets updated
    setAllowance(undefined);
    setBalance(undefined);
    setHighestBid(undefined);
  }

  const promote = async () => {
    if (!tokenId || !bid) {
      setStatus({
        title: 'Error!',
        body: 'Please provide a tokenId!',
        color: 'red'
      });
      return;
    } else if (!highestBid || bid.toBigInt() <= BigInt(highestBid)) {
      setStatus({
        title: 'Error!',
        body: 'New bid has to be higher than the highest bid!',
        color: 'red'
      });
      return;
    }

    const txHandle = await contract.bid(bid, tokenId, {
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

    let res = await txHandle.wait();

    setStatus({
      title: 'Success!',
      body: `Updated allowance!`,
      color: 'green',
      txHash: res.transactionHash
    });

    // reset so it gets updated
    setAllowance(undefined);
    setBalance(undefined);
    setHighestBid(undefined);
  }

  return (
    <Container size="xs" px="xs">
      <Center>
        <Text style={{fontSize: 32}} weight={700} variant="gradient">Promote your NFT now!</Text>
      </Center>
      <Text style={{fontSize: 18}}>Current highest bid: {highestBid && utils.formatUnits(highestBid, tokens.USDC.decimals)} USDC</Text>
      <Space h="md" />
      <SimpleGrid cols={1} spacing="xs">
        <TextInput 
          value={bid && utils.formatUnits(bid, 6).toString()}
          min={0}
          onChange={(e) => {try{setBid(utils.parseUnits(e.currentTarget.value, 6))}catch(_){}}}
          placeholder="6.9"
          label="Payment amount (USDC)"
          size="md"
        />

        <NumberInput 
          value={tokenId}
          min={0}
          onChange={(val) => setTokenId(val)}
          placeholder="420"
          label="NFT Id"
          size="md"
        />

        <Text style={{fontSize: 18}}>Your balance: {balance} USDC</Text>

        <Group position="center">
          <Button 
            variant="light" 
            color="cyan" 
            onClick={(bid && allowance && allowance.toBigInt() >= bid.toBigInt()) ? promote : approve}>
              { (bid && allowance && allowance.toBigInt() >= bid.toBigInt()) ? "Promote" : "Approve"}
          </Button>
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