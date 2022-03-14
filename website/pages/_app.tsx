import { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';
import AppWrap from '../components/AppWrap';
import { useState } from 'react';
import { Web3Provider } from 'zksync-web3';
import { PleaseConnect } from '../components/Metamask';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  const [provider, setProvider] = useState<Web3Provider|null>(null);

  const connect = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return;

      const provider = new Web3Provider(ethereum);

      await provider.send("eth_requestAccounts", []);

      setProvider(provider);
    } catch(err) {
      console.log(`error:`, err);
    }
  }

  return (
    <>
      <Head>
        <title>NFT Pedestal</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: 'dark',
        }}
      >
        <AppWrap app={provider ? <Component {...pageProps} provider={provider} /> : <PleaseConnect /> } connect={connect} provider={provider} />
      </MantineProvider>
    </>
  );
}