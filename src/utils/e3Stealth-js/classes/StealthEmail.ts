
import { StealthMail as StealthMailContract } from '../typechain/StealthMail';
import { Contract, JsonRpcSigner } from '../ethers';
import type { EthersProvider } from '../types';

export const stealthMailContractAddress = '0xAd350e43BEd11E9dBb59e56a5Ee34205bCF082ff';
export const stealthMailABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "pkx",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "ciphertext",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "cid",
        "type": "bytes"
      }
    ],
    "name": "Announcement",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "_receiver",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "_pkx",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "_ciphertext",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_cid",
        "type": "bytes"
      }
    ],
    "name": "sendEmail",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

export class StealthMail {
  readonly _stealthMail: StealthMailContract;

  /**
   * @notice Create StealthKeyRegistry instance to interact with the registry
   * @param signerOrProvider signer or provider to use
   */
  constructor(signerOrProvider: JsonRpcSigner | EthersProvider) {
    this._stealthMail = new Contract(stealthMailContractAddress, stealthMailABI, signerOrProvider) as unknown as StealthMailContract;
  }

  async sendStealthMail(_receiver: string,_pkx:string,_cipherText:string,_cid:string) {
    try{
        const tx = await this._stealthMail.sendEmail(_receiver,_pkx,_cipherText,_cid);
        console.log(tx)
        return true;
    }catch(err){
        console.log(err)
    }
    return false;
  }
 
}
