const zksync = require('zksync-web3');
const { ethers } = require('ethers');
const tokens = require('./website/components/tokens.json');
const contracts = require('./website/components/contracts.json');
const abi = require('./website/components/bidder-abi.json');

async function main() {
  const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
  if(!DEPLOYER_PRIVATE_KEY) throw new Error("DEPLOYER_PRIVATE_KEY not set!");
  
  // create providers
  const ethProvider = ethers.getDefaultProvider("goerli");
  const syncProvider = new zksync.Provider("https://zksync2-testnet.zksync.dev");
  
  const syncWallet = new zksync.Wallet(DEPLOYER_PRIVATE_KEY, syncProvider, ethProvider);
  
  const usdcBalanceBefore = await syncWallet.getBalance(tokens.USDC.address);
  console.log(`USDC Balance before withdrawal: ${ethers.utils.formatUnits(usdcBalanceBefore, tokens.USDC.decimals)}`);

  const contract = new zksync.Contract (
    contracts.bidder.address,
    abi,
    syncWallet
  );

  const txHandle = await contract.withdraw();

  await txHandle.wait();

  const usdcBalanceAfter = await syncWallet.getBalance(tokens.USDC.address);
  console.log(`USDC Balance after withdrawal: ${ethers.utils.formatUnits(usdcBalanceAfter, tokens.USDC.decimals)}`);
}

main();
