const hre = require("hardhat");

async function main() {
  console.log("Starting FortyTwoToken (with Multisig) deployment...\n");

  // Get deployer and signer accounts
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];

  console.log("Deployer address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "BNB\n");

  // Configuration
  const INITIAL_SUPPLY = 42000000;
  const REQUIRED_SIGNATURES = 2;

  // For testnet: use deployer as all 3 signers (demo purposes)
  // In production: use different addresses for each signer
  const multisigSigners = [
    deployer.address,  // Signer 1: deployer
    signers[1]?.address || deployer.address,  // Signer 2
    signers[2]?.address || deployer.address,  // Signer 3
  ];

  // Remove duplicates for single-account scenario
  const uniqueSigners = [...new Set(multisigSigners)];

  // Adjust required signatures if we have fewer unique signers
  const actualRequired = Math.min(REQUIRED_SIGNATURES, uniqueSigners.length);

  console.log("Multisig Configuration:");
  console.log("- Signers:", uniqueSigners.length);
  console.log("- Required signatures:", actualRequired);
  console.log("- Signer addresses:");
  uniqueSigners.forEach((addr, i) => console.log(`  ${i + 1}. ${addr}`));
  console.log("");

  // Deploy contract
  console.log("Deploying contract...");
  const FortyTwoToken = await hre.ethers.getContractFactory("FortyTwoToken");
  const token = await FortyTwoToken.deploy(
    INITIAL_SUPPLY,
    uniqueSigners,
    actualRequired
  );

  await token.waitForDeployment();

  const contractAddress = await token.getAddress();
  console.log("\n========================================");
  console.log("FortyTwoToken deployed successfully!");
  console.log("========================================");
  console.log("Contract address:", contractAddress);
  console.log("Token name:", await token.name());
  console.log("Token symbol:", await token.symbol());
  console.log("Total supply:", hre.ethers.formatEther(await token.totalSupply()), "F42T");
  console.log("Owner:", await token.owner());
  console.log("Multisig signers:", (await token.getSignerCount()).toString());
  console.log("Required signatures:", (await token.requiredSignatures()).toString());
  console.log("========================================\n");

  // Network information
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());

  if (network.chainId === 97n) {
    console.log("\nView on BSCScan:");
    console.log(`https://testnet.bscscan.com/address/${contractAddress}`);

    console.log("\nTo verify contract, run:");
    console.log(`npx hardhat verify --network bscTestnet ${contractAddress} ${INITIAL_SUPPLY} "[${uniqueSigners.map(s => `\\"${s}\\"`).join(",")}]" ${actualRequired}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
