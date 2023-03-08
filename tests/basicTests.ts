import { ethers } from "ethers";
import { expect } from "chai";
import { ipfsHashToHex, generateRandomLatentSpace, abiEncodeArray } from './helper'
let remix: ethers.Contract
let proxy: ethers.Contract

const provider = new ethers.providers.Web3Provider(web3Provider)

describe("Deploy and mint", function () {
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

  const ipfsHashModel = ipfsHashToHex('QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB')
  it("Should set a model", async function () {
    const [owner, minterA, modelOwnerA] = await ethers.getSigners();
    
    const tx = await remix.connect(modelOwnerA).setModel(ipfsHashModel)
    await tx.wait()    
  })

  it("Should mint a latent space", async function () {
    const [owner, minterA] = await ethers.getSigners();
        
    const latentSpace = generateRandomLatentSpace(100)
    remix = remix.connect(minterA)
    const encodedLatentSpace = abiEncodeArray(latentSpace)
    const tx = await remix.mint(ipfsHashModel, encodedLatentSpace, minterA.address, 0, { value: 1000 })
    await tx.wait()

    const tokenData = await remix.dataOf(0)
    expect(tokenData.latentSpace).to.be.equal(encodedLatentSpace)
  })
})

describe("withdraw balances", function () {
  it("Should fails withdraw from the contract owner", async function () {
    const [owner, minterA] = await ethers.getSigners();        
    await expect(remix.connect(owner).withdraw(1000, owner.address)).to.be.revertedWith('revert not enough balance')   
  })

  it("Should withdraw from the contract owner to another address", async function () {
    const [owner, minterA] = await ethers.getSigners();
    
    const balanceBefore = await provider.getBalance(minterA.address)
    const tx = await remix.connect(owner).withdraw(300, minterA.address)
    await tx.wait()
    const balanceAfter = await provider.getBalance(minterA.address)
    expect(balanceAfter).equals(balanceBefore.add(300), "wrong balance after withdraw")
  })
})