import { RevnuRegistry, RevnuToken } from "../../typechain-types"
import { deployments, ethers } from "hardhat"
import { assert, expect } from "chai"
import { formatEther, parseEther } from "ethers/lib/utils"
import { BigNumber } from "ethers"

describe("\n💸 Revnu Tests 💸", async () => {
  let revnuToken: RevnuToken
  let revnuRegistry: RevnuRegistry

  beforeEach(async () => {
    await deployments.fixture(["all"])
    revnuToken = await ethers.getContract("RevnuToken")
    revnuRegistry = await ethers.getContract("RevnuRegistry")
  })

  it("Create a bounty", async () => {
    // Approve tokens
    const approveTx = await revnuToken.approve(revnuRegistry.address, parseEther("2"))
    await approveTx.wait(1)

    // Log allowance
    await revnuToken
      .allowance(await revnuToken.signer.getAddress(), revnuRegistry.address)
      .then((res) => {
        console.log(`Allowance before creating bounty: ${formatEther(res.toString())}`)
      })

    const createBounty = await revnuRegistry.createBounty(
      "https://www.youtube.com/watch?v=o5uGF259Nw0",
      "Likes",
      100,
      parseEther("1")
    )
    let createBountyTx: any = await createBounty.wait(1)
    let createdBountyId = createBountyTx.events![0]!.args!.bountyId
    console.log("Created Bounty: ", createdBountyId.toString())

    const currentBountyId = await revnuRegistry.getLatestBountyId()
    console.log(`Created Bounty ID: `, createdBountyId.toString())

    assert.equal(createdBountyId.toString(), currentBountyId.toString(), "Bounty ID's do not match")

    let latestBounty: any = await revnuRegistry.bountyRegistry(currentBountyId)
    console.log("Created Bounty: ", latestBounty.toString())

    // Log allowance again
    await revnuToken
      .allowance(await revnuToken.signer.getAddress(), revnuRegistry.address)
      .then((res) => {
        console.log(`Allowance after creating bounty: ${formatEther(res.toString())}`)
      })

    // Show token balance
    await revnuToken.balanceOf(await revnuToken.signer.getAddress()).then((balance) => {
      console.log(`Balance before claiming: ${formatEther(balance.toString())}`)
    })

    console.log("\n\nClaiming bounty...")
    const claimBounty = await revnuRegistry.claimBounty(latestBounty.bountyId)
    await claimBounty.wait(1).then(async (tx) => {
      let claimedBountyClaimHash = tx.events![0]!.args!.claimHash
      console.log("Claimed Bounty Claim Hash: ", claimedBountyClaimHash)

      // Check if you can claim again
      await expect(revnuRegistry.claimBounty(latestBounty.bountyId)).to.be.revertedWith(
        "Bounty already claimed by user."
      )
    })

    // Show token balance
    await revnuToken.balanceOf(await revnuToken.signer.getAddress()).then((balance) => {
      console.log(`\nBalance after claiming: ${formatEther(balance.toString())}`)
    })
  })
})
