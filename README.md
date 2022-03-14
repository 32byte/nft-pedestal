# NFT-Pedestal

This a small dApp built on the zkSync 2.0 network. The purpose of this app was to try out the zkSync 2.0 network. You can checkout the app [here](https://nft-pedestal.vercel.app/).

For the "backend" the app uses a smart contract which is deployed on [zkSync 2.0](https://portal.zksync.io/).

The frontend is built using [NextJS](https://nextjs.org/) + [Mantine](https://mantine.dev/).

## How to use

### Home

The homepage displays the NFT with the highest bid.

### Mint

 Here you can mint your own NFT

### Promote

You can promote a NFT by sending USDC to the contract.

The NFT with the highest bid will be displayed on the homepage.

## Building

### Contracts

1. Edit the `example.env` file and rename it to `.env`
2. Source the `.env` file: `source .env`
3. Install dependencies: `yarn install`
4. Compile the contracts: `yarn hardhat compile`
5. Deploy the contract (which you selected in the `.env`-file): `yarn hardhat deploy-zksync`

### Website

1. Go to the website folder: `cd website`
2. Install dependencies: `yarn install`
3. Run dev: `yarn dev`


## Withdrawing

Only the contract deployer can withdraw the usdc from the contract.

You can only withdraw when the contract has more than 0 USDC.

To withdraw run: `yarn withdraw`