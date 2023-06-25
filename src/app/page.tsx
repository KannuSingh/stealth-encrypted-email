"use client";

import useAccount from "@/hooks/useAccount";
import { StealthKeyRegistry } from "@/utils/e3Stealth-js/classes/StealthKeyRegistry";
import { getPrivateKeys } from "@/utils/wallet";
import { JsonRpcSigner } from "@ethersproject/providers";
import { Signer } from "@ethersproject/abstract-signer";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ToastContainer";

export default function HomePage() {

  return (
        <Home/>
  );
}

export function Home() {
  
  const {  accounts,signer,provider,handleConnect } = useAccount();
  const router = useRouter()

  const handleRegister = async () => {
    // handle in future ,isConnecting,isDisconnected
   console.log(accounts)
   if(  accounts.length > 0 && signer != null){
    console.log("Wallet is connected")
    // use the user's connected account to signed a message and then generate a viewing and spending 
    // keys and save those in stealthAddressRegistry.
    console.log(await signer.getChainId())
    console.log(Signer.isSigner(signer))
    console.log(provider)
    const stealthKeyRegistry = new StealthKeyRegistry(signer as unknown as JsonRpcSigner)
    const isStealthKeysSet = await stealthKeyRegistry.isStealthKeysSet(accounts[0])
    if(!isStealthKeysSet){
      const stealthKeysPairs = await getPrivateKeys(signer as unknown as JsonRpcSigner)
      const tx = await stealthKeyRegistry.setStealthKeys(stealthKeysPairs.spendingKeyPair.publicKeyHex,stealthKeysPairs.viewingKeyPair.publicKeyHex,signer)
      console.log(tx)
    }else{
      console.log(`Stealth Keys MetaData Already Set`)
    }
   }else{
    showToast('Connect you wallet first');
    console.log("Connect you wallet first")
    // handleConnect()
   }
  }
  const handleSignIn = async () => {
    // handle in future ,isConnecting,isDisconnected
    console.log(accounts)
    if(  accounts.length > 0 && signer != null){
     console.log("Wallet is connected")
     // use the user's connected account to signed a message and then generate a viewing and spending 
     // keys and save those in stealthAddressRegistry.
     const stealthKeyRegistry = new StealthKeyRegistry(signer as unknown as JsonRpcSigner)
     const stealthKeysSet = await stealthKeyRegistry.getStealthKeys(accounts[0])
     console.log("Users Stealth Key Sets",stealthKeysSet)
     if(stealthKeysSet){
      const stealthKeysPairs = await getPrivateKeys(signer as unknown as JsonRpcSigner)

      localStorage.setItem('StealthKeysSet',JSON.stringify(stealthKeysPairs))
      router.push('/dashboard')
     }else{
       console.log(`Stealth Keys not set`)
     }
    }else{
      showToast('Connect you wallet first');
      // handleConnect()
    }
  }
  return (
    <div className="w-full p-4 md:p-8">
      <div className="flex items-center justify-center  mb-4">
        <h1 className="text-4xl font-bold">Welcome to Stealth Encrypted Onchain Email</h1>
        
      </div>
      <p className="text-xl text-gray-600 mb-8 text-center">Effortlessly Manage Your Encrypted Ethereum Email</p>
      <div className="flex justify-center items-center space-x-3" >
       
       
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 px-12 rounded-lg text-xl"
          onClick={handleRegister}
        >
          Register
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 px-12 rounded-lg text-xl"
          onClick={handleSignIn}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
