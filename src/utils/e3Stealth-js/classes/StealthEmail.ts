
import { StealthMail as StealthMailContract } from '../typechain/StealthMail';
import { Contract, JsonRpcSigner } from '../ethers';
import type { EthersProvider } from '../types';

const stealthMail = '0x45d1A5afdf1fBa11CC4e5E2Ca37Aa0BF7149B82A';
const abi = [
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
          "internalType": "bytes32",
          "name": "cid",
          "type": "bytes32"
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
          "internalType": "bytes32",
          "name": "_cid",
          "type": "bytes32"
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
    this._stealthMail = new Contract(stealthMail, abi, signerOrProvider) as unknown as StealthMailContract;
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
