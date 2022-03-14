import { Wallet, Provider } from "zksync-web3";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
const tokens = require('../website/components/tokens.json');

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  const VALID_TARGETS: any = {"NFT": { name: "MyNFT", args: []}, "BIDDING": { name: "Bidding", args: [tokens.USDC.address]}};

  const TARGET = process.env["TARGET"];
  if (!TARGET) throw new Error("TARGET not set!");
  if (!VALID_TARGETS[TARGET]) throw new Error("Target is not valid!");

  const DEPLOYER_PRIVATE_KEY = process.env["DEPLOYER_PRIVATE_KEY"];
  if(!DEPLOYER_PRIVATE_KEY) throw new Error("DEPLOYER_PRIVATE_KEY not set!");

  const FEE_TOKEN = process.env["FEE_TOKEN"];
  if(!FEE_TOKEN) throw new Error("FEE_TOKEN not set!");
  if(!tokens[FEE_TOKEN]) throw new Error("FEE_TOKEN not valid!");

  const artifactName = VALID_TARGETS[TARGET].name;
  console.log(`Running deploy script for the ${artifactName} contract with args=\"${VALID_TARGETS[TARGET].args.toString()}\"`);

  // Initialize the wallet.
  const provider = new Provider("https://zksync2-testnet.zksync.dev")
  const wallet = new Wallet(DEPLOYER_PRIVATE_KEY).connect(provider);
  const deployer = new Deployer(hre, wallet);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const artifact = await deployer.loadArtifact(artifactName);

  const contract = await deployer.deploy(artifact, VALID_TARGETS[TARGET].args, tokens[FEE_TOKEN].address);

  // Show the contract info.
  const contractAddress = contract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
}