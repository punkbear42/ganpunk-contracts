import { ethers } from "ethers";
import { expect } from "chai";
import { ipfsHashToHex, generateRandomLatentSpace, abiEncodeArray } from './helper'
let remix: ethers.Contract
let proxy: ethers.Contract

describe("Basic tests", function () {
  it("Deploy with proxy", async function () {
    const [owner] = await ethers.getSigners();

    const Remix = await ethers.getContractFactory("GanPunk");    
    remix = await Remix.connect(owner).deploy();
    await remix.deployed()

    const implAddress = remix.address
    console.log('implementation address', implAddress)

    const Proxy = await ethers.getContractFactory('ERC1967Proxy')
    proxy = await Proxy.connect(owner).deploy(implAddress, '0x8129fc1c')
    await proxy.deployed()
    console.log("GanPunk deployed to:", proxy.address);

    remix = await ethers.getContractAt("GanPunk", proxy.address)
    remix = remix.connect(owner)

    expect(await remix.name()).to.equal('GanPunk');
  })

  it("Should mint a latent space", async function () {
    const [owner, minterA] = await ethers.getSigners();
    // console.log('test', ipfsHashToHex)
    const ipfsHashModel = ipfsHashToHex('QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB')
    
    const latentSpace = generateRandomLatentSpace(100)
    remix = remix.connect(minterA)
    const encodedLatentSpace = abiEncodeArray(latentSpace)
    const tx = await remix.mint(ipfsHashModel, encodedLatentSpace, minterA.address, 0)
    await tx.wait()

    const tokenData = await remix.dataOf(0)
    expect(tokenData.latentSpace).to.be.equal(encodedLatentSpace)
  })
})