import { isHexString } from "ethers/lib/utils";
import { KeyPair } from "./e3Stealth-js/classes/KeyPair";
import { RandomNumber } from "./e3Stealth-js/classes/RandomNumber";
import { EthersProvider } from "./e3Stealth-js/types";
import { StealthKeyRegistry } from "./e3Stealth-js/classes/StealthKeyRegistry";

export async function prepareSend(recipientAccount: string,emailCid:string, recipientViewingPublicKey:string, recipientSpendingPublicKey:string) {
    
    const recipientSpendingKeyPair = new KeyPair(recipientSpendingPublicKey);
    const recipientViewingKeyPair = new KeyPair(recipientViewingPublicKey);

    // Generate random number
    const randomNumber = new RandomNumber();

    // Encrypt random number with recipient's public key
    const encryptedRandomNumber = recipientViewingKeyPair.encrypt(randomNumber);
    // // Encrypt email CID with recipient's public key
    // const encryptedCID = recipientViewingKeyPair.encrypt(emailCid);

    // Get x,y coordinates of ephemeral private key
    const { pubKeyXCoordinate } = KeyPair.compressPublicKey(encryptedRandomNumber.ephemeralPublicKey);

    // Compute stealth address
    const stealthKeyPair = recipientSpendingKeyPair.mulPublicKey(randomNumber);

    return { stealthKeyPair, pubKeyXCoordinate, encryptedRandomNumber,emailCid };
  }

  export async function lookupRecipient(
    id: string,
    provider: EthersProvider,
    {
      advanced,
      supportPubKey,
      supportTxHash,
    }: { advanced?: boolean; supportPubKey?: boolean; supportTxHash?: boolean } = {}
  ) {
    // Check if identifier is a public key. If so we just return that directly
    const isPublicKey = id.length === 132 && isHexString(id);
    if (supportPubKey && isPublicKey) {
      return { spendingPublicKey: id, viewingPublicKey: id };
    }
  
    // Check if identifier is a transaction hash. If so, we recover the sender's public keys from the transaction
    const isTxHash = id.length === 66 && isHexString(id);
    if (supportTxHash && isTxHash) {
      const publicKey = await recoverPublicKeyFromTransaction(id, provider);
      assertValidPoint(publicKey);
      return { spendingPublicKey: publicKey, viewingPublicKey: publicKey };
    }
  
    // The remaining checks are dependent on the advanced mode option. The provided identifier is now either an
    // ENS name, CNS name, or address, so we resolve it to an address
    const address = await toAddress(id, provider); // throws if an invalid address is provided
  
    // If we're not using advanced mode, use the StealthKeyRegistry
    if (!advanced) {
      const registry = new StealthKeyRegistry(provider);
      return registry.getStealthKeys(address);
    }
  
    // Otherwise, get public key based on the most recent transaction sent by that address
    const txHash = await getSentTransaction(address, provider);
    if (!txHash) throw new Error('Could not get public key because the provided account has not sent any transactions');
    const publicKey = await recoverPublicKeyFromTransaction(txHash, provider);
    assertValidPoint(publicKey);
    return { spendingPublicKey: publicKey, viewingPublicKey: publicKey };
  }
  export async function getSentTransaction(address: string, ethersProvider: EthersProvider) {
    address = getAddress(address); // address input validation
    const { chainId } = await ethersProvider.getNetwork();
    const txHistoryProvider = new TxHistoryProvider(chainId);
    const history = await txHistoryProvider.getHistory(address);
    let txHash;
    // Use the first transaction found
    for (let i = 0; i < history.length; i += 1) {
      const tx = history[i];
      if (tx.from === address) {
        // On Arbitrum, we need to make sure this is actually a signed transaction that we can recover a public key
        // from, since not all transactions returned by Etherscan are actually signed transactions: some are just
        // messages. This is a bit inefficient since it's an additional RPC call, and this method just returns the
        // txHash instead of the full transaction data, so we end up  making the same RPC call again later, but
        // that's ok for now. We identify signed transactions by just looking for the presence of a signature.
        if (chainId === 42161) {
          const txData = await getTransactionByHash(tx.hash, ethersProvider);
          const isSignedTx = txData.r !== HashZero && txData.s !== HashZero;
          if (!isSignedTx) continue;
        }
        txHash = tx.hash;
        break;
      }
    }
    return txHash;
  }
  async function getTransactionByHash(txHash: string, provider: EthersProvider): Promise<TransactionResponseExtended> {
    // Initial response contains all fields, including non-standard fields.
    const params = { transactionHash: provider.formatter.hash(txHash, true) };
    const fullTx = await provider.perform('getTransaction', params);
    if (!fullTx) {
      throw new Error('Transaction hash not found. Are the provider and transaction hash on the same network?'); // prettier-ignore
    }
    // We use the formatter to parse values into the types ethers normally returns, but this strips non-standard fields.
    const partialTx = <TransactionResponseExtended>provider.formatter.transactionResponse(fullTx);
    // Now we add back the missing fields, with custom typing by field.
    const bigNumberFields = new Set(['gas']); // ethers renames this to gasLimit, but for completeness we add `gas` back.
    const numberFields = new Set([
      // Arbitrum.
      'arbSubType',
      'arbType',
      'indexInParent',
      'l1BlockNumber',
      // Optimism.
      'index',
      'l1BlockNumber',
      'l1Timestamp',
      'queueIndex',
    ]);
    const tx = <TransactionResponseExtended>{ ...partialTx };
    const existingFields = new Set(Object.keys(tx));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Object.keys(fullTx).forEach((key) => {
      // Do nothing if this field already exists (i.e. it was formatted by the ethers formatter).
      if (existingFields.has(key)) return;
      // Otherwise, add the field and format it
      if (bigNumberFields.has('key')) {
        tx.gas = fullTx[key] ? BigNumber.from(fullTx[key]) : null;
      } else if (numberFields.has(key)) {
        tx[key] = fullTx[key] ? BigNumber.from(fullTx[key]).toNumber() : null;
      } else {
        tx[key] = fullTx[key];
      }
    });
    return tx;
  }
  export async function recoverPublicKeyFromTransaction(txHash: string, provider: EthersProvider) {
    // Get transaction data
    if (typeof txHash !== 'string' || txHash.length !== lengths.txHash) {
      throw new Error('Invalid transaction hash provided');
    }
    const tx = await getTransactionByHash(txHash, provider);
    if (!tx) {
      throw new Error('Transaction not found. Are the provider and transaction hash on the same network?');
    }
  
    // Reconstruct transaction payload that was originally signed. Relevant EIPs:
    //   - https://eips.ethereum.org/EIPS/eip-155  (EIP-155: Simple replay attack protection)
    //   - https://eips.ethereum.org/EIPS/eip-2718 (EIP-2718: Typed Transaction Envelope)
    //   - https://eips.ethereum.org/EIPS/eip-2930 (EIP-2930: Optional access lists)
    //   - https://eips.ethereum.org/EIPS/eip-1559 (EIP-1559: Fee market change for ETH 1.0 chain)
    //
    // Properly defining the `txData` signed by the sender is essential to ensuring sent funds can be
    // accessed by the recipient. This only affects the "advanced mode" option of sending directly
    // to a recipient's standard public key, i.e. is does not affect users sending via the
    // recommended approach of the StealthKeyRegistry.
    //
    // Any time a new transaction type is added to Ethereum, the below will need to be updated to
    // support that transaction type
    const txData: UnsignedTransaction = {};
  
    // First we add fields that are always required
    txData.type = tx.type;
    txData.nonce = tx.nonce;
    txData.gasLimit = tx.gasLimit;
    txData.to = tx.to;
    txData.value = tx.value;
    txData.data = tx.data;
    if (tx.chainId) {
      txData.chainId = tx.chainId;
    }
  
    // Now we add fields specific to the transaction type
    if (tx.type === 0 || !tx.type) {
      // LegacyTransaction is rlp([nonce, gasPrice, gasLimit, to, value, data, v, r, s])
      txData.gasPrice = tx.gasPrice;
    } else if (tx.chainId === 42161 && tx.type === 120) {
      // This block is for handling Classic (pre-Nitro) transactions on Arbitrum. If given a legacy
      // transaction hash on Arbitrum, when querying a Nitro node for that pre-nitro tx, the type
      // should be 120. However, if you query classic node for the data, the type would be 0.
      // Different RPC providers handle this differently. For example, `https://arb1.arbitrum.io/rpc`
      // and Infura will return type 120, but Alchemy will return type 0. If type 0 is returned, it's
      // handled by the previous block. If type 120 is returned, we handle it here. This block is
      // required since ethers.js v5 won't serialize transactions unless the `type` is null,  0, 1,
      // or 2, as seen here:
      //   https://github.com/ethers-io/ethers.js/blob/aaf40a1ccedd2664041938f1541d8a0fc3b8ae4d/packages/transactions/src.ts/index.ts#L305-L328
      // These transactions can be serialized the same way as legacy type 0 transactions, so we just
      // override the type here. For reference, the arbitrum transaction type definitions can be
      // found here:
      //  https://github.com/OffchainLabs/go-ethereum/blob/141b0fcdf0e4d8e9e5de3f0466533b86563f2d29/core/types/transaction.go#L54.
  
      // LegacyTransaction is rlp([nonce, gasPrice, gasLimit, to, value, data, v, r, s])
      txData.gasPrice = tx.gasPrice;
      txData.type = 0;
    } else if (tx.type === 1) {
      // 0x01 || rlp([chainId, nonce, gasPrice, gasLimit, to, value, data, accessList, v, r, s])
      txData.gasPrice = tx.gasPrice;
      txData.accessList = tx.accessList;
    } else if (tx.type === 2) {
      // 0x02 || rlp([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data, accessList, v, r, s])
      txData.accessList = tx.accessList;
      txData.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;
      txData.maxFeePerGas = tx.maxFeePerGas;
    } else {
      throw new Error(`Unsupported transaction type: ${tx.type}`);
    }
  
    // Properly format transaction payload to get the correct message
    const resolvedTx = await resolveProperties(txData);
    const rawTx = serializeTransaction(resolvedTx);
    const msgHash = keccak256(rawTx);
  
    // Recover sender's public key.
    // Even though the type definitions say v,r,s are optional, they will always be defined: https://github.com/ethers-io/ethers.js/issues/1181
    const signature = new Signature(BigInt(tx.r!), BigInt(tx.s!));
    signature.assertValidity();
    const recoveryParam = splitSignature({ r: tx.r as string, s: tx.s, v: tx.v }).recoveryParam;
    const publicKey = Point.fromSignature(msgHash.slice(2), signature, recoveryParam);
    publicKey.assertValidity();
  
    // Verify that recovered public key derives to the transaction from address.
    const publicKeyHex = `0x${publicKey.toHex()}`;
    if (computeAddress(publicKeyHex) !== tx.from) {
      throw new Error('Public key not recovered properly');
    }
    return publicKeyHex;
  }