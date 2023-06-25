import { JsonRpcSigner ,JsonRpcProvider} from '@ethersproject/providers';
import { KeyPair } from "./e3Stealth-js/classes/KeyPair";
import { hexlify, isHexString, sha256, toUtf8Bytes } from 'ethers/lib/utils';

/**
   * @notice Asks a user to sign a message to generate two Umbra-specific private keys for them
   * @dev Only safe for use with wallets that implement deterministic ECDSA signatures as specified by RFC 6979 (which
   * might be all of them?)
   * @param signer Signer to sign message from
   * @returns Two KeyPair instances, for the spendingKeyPair and viewingKeyPair
   */
async function generatePrivateKeys(signer: JsonRpcSigner ) {
    // Base message that will be signed
    const baseMessage = 'Sign this message to access your E3 account.\n\nOnly sign this message for a trusted client!'; // prettier-ignore
    const provider : JsonRpcProvider = signer.provider
    // Append chain ID if not mainnet to mitigate replay attacks
    const { chainId } = await provider.getNetwork();
    const message = chainId === 1 ? baseMessage : `${baseMessage}\n\nChain ID: ${chainId}`;

    // Get 65 byte signature from user using personal_sign
    const userAddress = await signer.getAddress();
    const formattedMessage = hexlify(toUtf8Bytes(message));
    console.log(formattedMessage)
    const signature = String(await provider.send('personal_sign', [formattedMessage, userAddress.toLowerCase()]));
    console.log(signature)
    // If a user can no longer access funds because their wallet was using eth_sign before this update, stand up a
    // special "fund recovery login page" which uses the commented out code below to sign with eth_sign
    //     const signature = await signer.signMessage(message);

    // Verify signature
    const isValidSignature = (sig: string) => isHexString(sig) && sig.length === 132;
    if (!isValidSignature(signature)) {
      throw new Error(`Invalid signature: ${signature}`);
    }

    // Split hex string signature into two 32 byte chunks
    const startIndex = 2; // first two characters are 0x, so skip these
    const length = 64; // each 32 byte chunk is in hex, so 64 characters
    const portion1 = signature.slice(startIndex, startIndex + length);
    const portion2 = signature.slice(startIndex + length, startIndex + length + length);
    const lastByte = signature.slice(signature.length - 2);

    if (`0x${portion1}${portion2}${lastByte}` !== signature) {
      throw new Error('Signature incorrectly generated or parsed');
    }

    // Hash the signature pieces to get the two private keys
    const spendingPrivateKey = sha256(`0x${portion1}`);
    const viewingPrivateKey = sha256(`0x${portion2}`);

    // Create KeyPair instances from the private keys and return them
    const spendingKeyPair = new KeyPair(spendingPrivateKey);
    const viewingKeyPair = new KeyPair(viewingPrivateKey);
    return { spendingKeyPair, viewingKeyPair };
  }

/**
   * @notice Prompts user for a signature to generate Umbra-specific private keys
   */
export async function getPrivateKeys(signer:JsonRpcSigner) {
    if (!signer) throw new Error('No signer connected');
    // if (!umbra.value) throw new Error('No Umbra instance available. Please make sure you are on a supported network');
    // if (spendingKeyPair.value && viewingKeyPair.value) {
    //   return 'success';
    // }
    
    try {
      const keyPairs = await generatePrivateKeys(signer);
      console.log(`spendingKeyPair: ${keyPairs.spendingKeyPair}`)
      console.log(`viewingKeyPair: ${keyPairs.viewingKeyPair}`)
    //   spendingKeyPair.value = keyPairs.spendingKeyPair;
    //   viewingKeyPair.value = keyPairs.viewingKeyPair;
      return keyPairs;
    } catch (err) {
      console.error(err);
      throw err   // most likely user rejected the signature
    }
  }
