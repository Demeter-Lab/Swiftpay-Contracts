require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const {
  API_URL_BASESEPOLIA,
  API_URL_BASEMAINNET,
  PRIVATE_KEY,
  MAINNET_PRIVATE_KEY,
  BASESCAN_API_KEY,
  BASESEPOLIA_API_URL,
} = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    hardhat: {},
    base: {
      url: API_URL_BASEMAINNET,
      accounts: [`0x${MAINNET_PRIVATE_KEY}`],
    },
    basesepolia: {
      url: API_URL_BASESEPOLIA,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      base: BASESCAN_API_KEY,
      basesepolia: BASESCAN_API_KEY,
    },
    customChains: [
      {
        network: "basesepolia",
        chainId: 84532,
        urls: {
          apiURL: BASESEPOLIA_API_URL,
          browserURL: "https://sepolia.basescan.org/",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
};
