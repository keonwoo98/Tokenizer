const hre = require("hardhat");

async function main() {
  console.log("Starting FortyTwoToken deployment...\n");

  // Get deployer information
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "BNB\n");

  // Initial supply: 42,000,000 tokens
  const INITIAL_SUPPLY = 42000000;

  // Deploy contract
  console.log("Deploying contract...");
  const FortyTwoToken = await hre.ethers.getContractFactory("FortyTwoToken");
  const token = await FortyTwoToken.deploy(INITIAL_SUPPLY);

  await token.waitForDeployment();

  const contractAddress = await token.getAddress();
  console.log("\n========================================");
  console.log("FortyTwoToken deployed successfully!");
  console.log("========================================");
  console.log("Contract address:", contractAddress);
  console.log("Token name:", await token.name());
  console.log("Token symbol:", await token.symbol());
  console.log("Total supply:", hre.ethers.formatEther(await token.totalSupply()), "F42T");
  console.log("========================================\n");

  // Network information
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());

  if (network.chainId === 97n) {
    console.log("\nView on BSCScan:");
    console.log(`https://testnet.bscscan.com/address/${contractAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
