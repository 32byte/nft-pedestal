import { utils, Wallet, Provider } from "zksync-web3";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  const artifactName = process.env["ARTIFACT"] || "MyNFT";

  console.log(`Running deploy script for the ${artifactName} contract`);

  // Initialize the wallet.
  const PRIVATE_KEY = process.env["DEPLOYER_PRIVATE_KEY"];
  if(!PRIVATE_KEY) throw new Error("DEPLOYER_PRIVATE_KEY not set!");
  
  const provider = new Provider("https://zksync2-testnet.zksync.dev")
  const wallet = new Wallet(PRIVATE_KEY).connect(provider);
  const balance = await wallet.getBalance(utils.ETH_ADDRESS);

  if (balance.isZero()) throw new Error("Please deposit eth into L2");

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact(artifactName);

  // TODO: different deploy things
  const contract = await deployer.deploy(artifact, ["0xd35CCeEAD182dcee0F148EbaC9447DA2c4D449c4"]);

  // Show the contract info.
  const contractAddress = contract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
}