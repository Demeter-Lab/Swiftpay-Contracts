const { ethers } = require("hardhat");
require("dotenv").config();

const { PRIVATE_KEY, API_URL_BASESEPOLIA, API_URL_BASEMAINNET } = process.env;
const SWIFTPAY_CONTRACT_ADDR = "0x517b3753cD4148ff68535Bf6a8F61e47E5b96f9a"; // testnet
// USDC BASE-MAINNET: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
const USDC_BASESEPOLIA_ADDR = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const contractABI = [
  "function transferUsdc(address recipient, uint256 value) external",
  "function batchTransferUsdc(address[] memory recipients, uint256[] memory values) external",
  "function getUsdcBalance(address addr) public view returns (uint)",
  "function getTotalTxns() public view returns (uint256)",
];
const usdcContractABI = [
  "function approve(address spender, uint256 value) external returns (bool)",
];

async function main() {
  const contractAddress = SWIFTPAY_CONTRACT_ADDR;

  const provider = new ethers.providers.JsonRpcBatchProvider(
    API_URL_BASESEPOLIA
  );
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Initialize contract instance
  const swiftPayUSDC = new ethers.Contract(
    contractAddress,
    contractABI,
    wallet
  );
  const usdcContract = new ethers.Contract(
    USDC_BASESEPOLIA_ADDR,
    usdcContractABI,
    wallet
  );

  try {
    // Check USDC balance
    async function getUsdcBalance(address) {
      const balance = await swiftPayUSDC.getUsdcBalance(address);
      const formattedBalance = ethers.utils.formatUnits(balance, 6);
      console.log(`USDC Balance: ${Number(formattedBalance).toFixed(2)} USDC`);
      return;
    }
    await getUsdcBalance("0xd5b1aa8077F6a7D0CeA83Ac81AAb3EC018Aa2c1A");

    // Transfer USDC to a single recipient
    async function singleUsdcTransfer(recipientAddr, amount) {
      const formattedAmount = ethers.utils.parseUnits(amount, 6);
      console.log(`Approving ${formattedAmount} USDC....`);
      const approveTx = await usdcContract.approve(
        SWIFTPAY_CONTRACT_ADDR,
        formattedAmount
      );
      await approveTx.wait();
      console.log(`Approved ${formattedAmount} USDC for spending..`);
      console.log(
        `Transferring ${ethers.utils.formatUnits(
          formattedAmount,
          6
        )} USDC to ${recipientAddr}...`
      );
      const tx1 = await swiftPayUSDC.transferUsdc(
        recipientAddr,
        formattedAmount
      );
      console.log("Transaction sent, awaiting confirmation...");
      await tx1.wait();
      console.log(`Transfer successful: ${tx1.hash}`);
    }
    // await singleUsdcTransfer("0x1339514086Fc15C5e38AF4E0407C469Ca3911992", "2");

    // Batch transfer USDC to multiple recipients
    /**
     *
     * @param {*} recipients e.g.  ["0xRecipient1AddressHere", "0xRecipient2AddressHere"]
     * @param {*} amounts e.g. ["5","3",etc] the numbers here MUST be in STRING format
     */
    async function batchTransferUSDC(recipients = [], amounts = []) {
      const formattedAmountValues = amounts.map((amount) =>
        ethers.utils.parseUnits(amount, 6)
      );

      const totalUSDCToTransfer = amounts.reduce(
        (total, amount) => Number(total) + Number(amount),
        0
      );

      const formattedTotal = ethers.utils.parseUnits(
        `${totalUSDCToTransfer}`,
        6
      );
      console.log(
        `Approving ${ethers.utils.formatUnits(formattedTotal, 6)} USDC....`
      );
      const approveTx = await usdcContract.approve(
        SWIFTPAY_CONTRACT_ADDR,
        formattedTotal
      );
      await approveTx.wait();
      console.log(`Approved ${formattedTotal} USDC for spending..`);

      console.log(
        `Batch transferring USDC to recipients: ${recipients.join("\n")}...`
      );
      const tx2 = await swiftPayUSDC.batchTransferUsdc(
        recipients,
        formattedAmountValues
      );
      console.log("Batch transaction sent, awaiting confirmation...");
      await tx2.wait();
      console.log(`Batch transfer successful: ${tx2.hash}`);
    }
    batchTransferUSDC(
      [
        "0xaA96052CbEFc4d9c8daEB069884A99E2cEFFB371",
        "0x1339514086Fc15C5e38AF4E0407C469Ca3911992",
      ],
      ["1", "1"]
    );

    // Fetch the total number of transactions
    async function getTotalNumberOfTxns() {
      const totalTxns = await swiftPayUSDC.getTotalTxns();
      console.log(`Total Transactions: ${totalTxns}`);
      return totalTxns;
    }
    getTotalNumberOfTxns();
  } catch (error) {
    console.error("Error interacting with the contract:", error);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});
