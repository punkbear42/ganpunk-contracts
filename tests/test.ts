import { ethers } from "ethers";

console.log(ethers.utils.hexlify([9, 10]))

console.log(ethers.utils.defaultAbiCoder.encode(["uint[]"], [[9, 10]]))

console.log(ethers.utils.defaultAbiCoder.encode([ "uint[]"], [ [ 1234, 5678 ]]))
