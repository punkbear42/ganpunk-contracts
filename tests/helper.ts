import * as multihash from 'multihashes'
import { ethers } from "ethers";

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export const generateRandomLatentSpace = (dim: number) => {
    let array = []
    while (array.length <= dim) {
        array.push(getRandomInt(0, 100000000))
    }
    return array
}

export const abiEncodeArray = (array: Array<number>) => {
    return ethers.utils.defaultAbiCoder.encode(["uint[]"], [array])
}

export const ipfsHashToHex = (ipfsHash) => {
    let buf = multihash.fromB58String(ipfsHash);
    return '0x' + multihash.toHexString(buf);
}