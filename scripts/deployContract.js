const hre = require("hardhat");

/// To verify:
// Verifying contracts (without args): npx hardhat verify --network goerli 0xb913c3Ba88E507C98f9e8f6Bbb45dE1Ce707126B
// Verifying contracts (with args): npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1"

async function main() {
  // USDC BASE-MAINNET: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
  // USDC BASE-SEPOLIA: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
  const usdcContractAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const contract = await hre.ethers.deployContract("SwiftPayUSDC", [
    usdcContractAddress,
  ]);
  console.log("Deploying contract....");
  await contract.waitForDeployment();

  console.log(
    `SwiftPay USDC contract deployed to: \nAddress: ${contract.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
