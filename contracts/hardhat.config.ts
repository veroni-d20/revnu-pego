import "@typechain/hardhat"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-ethers"
import "hardhat-gas-reporter"
import "dotenv/config"
import "solidity-coverage"
import "hardhat-deploy"
import { HardhatUserConfig } from "hardhat/config"

const PRIVATE_KEY = process.env.PRIVATE_KEY || "privateKey"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
    },
    localhost: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
    },
    mumbai: {
      chainId: 80001,
      allowUnlimitedContractSize: true,
      gas: 2100000,
      gasPrice: 8000000000,
      url: "https://polygon-mumbai-bor.publicnode.com	",
      accounts: [process.env.PRIVATE_KEY || ""],
    },
    pegoTestNet: {
      url: "https://rpc.pegotest.net/",
      accounts: [PRIVATE_KEY],
      chainId: 123456,
      gas: 500000000000,
      gasPrice: 500000000000,
      allowUnlimitedContractSize: true,
    },
    pegoMainNet: {
      url: "https://rpc.pego.io/",
      accounts: [PRIVATE_KEY],
      chainId: 20201022,
      allowUnlimitedContractSize: true,
    },
    // Network name: PEGO Mainnet Chain ID: 20201022 Currency Symbol: PG RPC node: pegorpc.com node1.pegorpc.com node2.pegorpc.com node3.pegorpc.com
    // sepolia: {
    //   url: SEPOLIA_RPC_URL,
    //   accounts: [PRIVATE_KEY],
    //   chainId: 11155111,
    // },
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
  mocha: {
    timeout: 200000, // 200 seconds max for running tests
  },
}

export default config
