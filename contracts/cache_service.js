const express = require("express")
const { ethers } = require("ethers")
const { MongoClient } = require("mongodb")
const dotenv = require("dotenv")
dotenv.config()

const REGISTRY = require("./deployments/pegoTestNet/RevnuRegistry.json")
const TOKEN = require("./deployments/pegoTestNet/RevnuToken.json")
const config = require("./hardhat.config.ts")

const app = express()
const port = 3002

// Initialize your Ethereum provider (e.g., Infura)
const provider = new ethers.providers.JsonRpcProvider(config.networks.pegoTestNet.url)
let chainId = config.networks.pegoTestNet.chainId

const client = new MongoClient(process.env.MONGO_URI)
const db = client.db("revnu")

// Connect to the contract
const tokenContract = new ethers.Contract(TOKEN.address, TOKEN.abi, provider)
const registryContract = new ethers.Contract(REGISTRY.address, REGISTRY.abi, provider)

// Start listening to the event
tokenContract.on("*", async (event) => {
  // console.log('Event emitted:');
  console.log(event) // Log the event data
  await db.collection("electra-events").insertOne({ ...event, chainId })
})

registryContract.on("*", async (event) => {
  // console.log('Event emitted:');
  console.log(event) // Log the event data
  await db.collection("electra-events").insertOne({ ...event, chainId })
})

// Start the Express.js server
app.listen(port, () => {
  client.connect().then(() => {
    console.log("Connected successfully to server")
  })
  console.log(`Express server listening on port ${port}`)
})
