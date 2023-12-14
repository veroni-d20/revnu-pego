import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains } from "../helper-hardhat-config"

const deployRevnuRegistry: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const revnuToken = await get("RevnuToken")

  log("----------------------------------------------------")
  log("Deploying RevnuRegistry and waiting for confirmations...")
  const revnuRegistry = await deploy("RevnuRegistry", {
    from: deployer,
    args: [revnuToken.address],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name]?.blockConfirmations || 1,
  })
  log(`RevnuRegistry at ${revnuRegistry.address}`)
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(revnuRegistry.address, [])
  }
}

export default deployRevnuRegistry
deployRevnuRegistry.tags = ["all", "registry"]
