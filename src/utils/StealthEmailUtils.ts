import { getAddress, isHexString } from "ethers/lib/utils";
import { KeyPair } from "./e3Stealth-js/classes/KeyPair";
import { RandomNumber } from "./e3Stealth-js/classes/RandomNumber";

export interface Announcement {
  from:string;
  timestamp:string;
  receiver: string;
  pkx: string;
  ciphertext: string;
  cid: string;
}

export interface AnnouncementForUser {
  announcement:Announcement,
  isForUser:boolean
  randomNumber:string 
}

export async function prepareSend(emailCid:string, recipientViewingPublicKey:string, recipientSpendingPublicKey:string) {
    
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


  export function isAnnouncementForUser(spendingPublicKey: string, viewingPrivateKey: string, announcement:Announcement) {
    try {
      // Get y-coordinate of public key from the x-coordinate by solving secp256k1 equation
      const { receiver, pkx, ciphertext,cid } = announcement;
      const uncompressedPubKey = KeyPair.getUncompressedFromX(pkx);

      // Decrypt to get random number
      const payload = { ephemeralPublicKey: uncompressedPubKey, ciphertext };
      const viewingKeyPair = new KeyPair(viewingPrivateKey);
      const randomNumber = viewingKeyPair.decrypt(payload);

      // Get what our receiving address would be with this random number
      const spendingKeyPair = new KeyPair(spendingPublicKey);
      const computedReceivingAddress = spendingKeyPair.mulPublicKey(randomNumber).address;

      // If our receiving address matches the event's recipient, the transfer was for the user with the specified keys
      return { announcement:announcement ,isForUser: computedReceivingAddress === getAddress(receiver), randomNumber };
    } catch (err) {
      // We may reach here if people use the sendToken method improperly, e.g. by passing an invalid pkx, so we'd
      // fail when uncompressing. For now we just silently ignore these and return false
      return { announcement:announcement,isForUser: false, randomNumber: '' };
    }
  }