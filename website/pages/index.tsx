import { Center, Container, Image, Notification, Text } from '@mantine/core';
import { ethers } from 'ethers';
import { Contract } from 'zksync-web3';
import React, { useEffect, useState } from 'react';
const nftAbi = require('../components/nft-abi.json');
const bidderAbi = require('../components/bidder-abi.json');
const contracts = require('../components/contracts.json');

declare global {
  interface Window { ethereum: ethers.providers.ExternalProvider }
}

const Home = (props: any) => {
  const { provider } = props;
  const [uri, setURI] = useState<string|null>(null);
  const [error, setError] = useState<boolean>(false);
  const [tokenId, setTokenId] = useState<BigInt|undefined>(undefined);

  const nftContract = new Contract(
    contracts.nft.address,
    nftAbi,
    provider.getSigner()
  );

  const bidderContract = new Contract(
    contracts.bidder.address,
    bidderAbi,
    provider.getSigner()
  );

  const loadTokenId = async () => {
    const tokenId = await bidderContract.tokenId();
    setTokenId(tokenId.toBigInt());
  }

  useEffect(() => {
    loadTokenId();

    if(!tokenId) return;
    
    nftContract.tokenURI(tokenId)
      .then((uri: string) => {
        setURI(uri);
        setError(false);
      })
      .catch(() => {
        setURI(null);
        setError(true);
      });
  });

  useEffect(() => {
    const timer = setInterval(() => loadTokenId(), 10000);
    return () => clearInterval(timer);
  })

  if (!tokenId) return <Center><p>Loading, please wait..</p></Center>


  return (
    <Container size="xs" px="xs">
      <Center>
        <Text style={{fontSize: 32}} weight={700} variant="gradient">NFT #{tokenId.toString()} is being displayed</Text>
      </Center>
      { uri && <Image radius="md" src={uri} alt={`NFT #${tokenId}`}/> }
      { error && 
      <Notification onClose={() => setError(false)} color="red">
        Couldn&apos;t load image of NFT #{tokenId}
      </Notification> }
    </Container>
  );
}


export default Home
