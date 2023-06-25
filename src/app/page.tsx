"use client";

import useAccount from "@/hooks/useAccount";
import { JsonRpcSigner } from "@ethersproject/providers";
import { Signer } from "@ethersproject/abstract-signer";
import { useRouter } from "next/navigation";

export default function HomePage() {

  return (
        <Home/>
  );
}

export function Home() {
  

  const handleRegister = async () => {
    
  }
  const handleSignIn = async () => {
    
  }
  
  return (
    <div className="w-full p-4 md:p-8">
      <div className="flex items-center justify-center  mb-4">
        <h1 className="text-4xl font-bold">Welcome to Stealth Encrypted Onchain Email Manager!</h1>
        {/* <div className="space-x-4">
            <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            onClick={handleConnect}>
            Connect
          </button>
          
          <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
            Explore Demo
          </button>
        </div> */}
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
        {/* <Link href="/dashboard">Try it out</Link> */}
      </div>
      
      {/* <div className="max-w-lg bg-white rounded-lg p-4 md:p-8 shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Key Features:</h2>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="border border-gray-200 rounded p-4">
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}
