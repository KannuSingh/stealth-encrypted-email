'use client'
import React, { createContext, useState } from 'react'
import { ethers } from 'ethers';

type AccountContextType = {
  accounts: string[]
  signer: ethers.Signer | null
  provider: ethers.providers.Web3Provider | null
  handleConnect: () => void
  handleDisconnect: () => void
}

type AccountProviderProps = {
  children: React.ReactNode
}

// Create the context
export const AccountContext = createContext<AccountContextType>({
  accounts: [],
  signer: null,
  provider: null,
  handleConnect: () => {},
  handleDisconnect: () => {}
});

// Context Provider component
export function AccountProvider({ children }: AccountProviderProps) {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  // const [chainId,setChainId] = useState()
  const connectWallet = async () => {
    console.log("In Connect Wallet");
    // Check if MetaMask is installed
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        // Request connection to MetaMask
        const ethereum = window.ethereum
        // const _chainId = await window.ethereum.request({ method: 'eth_chainId' });
        // setChainId(_chainId)
        const accounts: string[] = await ethereum.request({
          method: "eth_requestAccounts"
        });

        setAccounts(accounts);
        // Create a provider and signer from the current Ethereum provider
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await web3Provider.getSigner();

        // Set the signer and provider in the context
        setSigner(signer);
        setProvider(web3Provider);
        // Connection successful
        console.log('Connected to MetaMask');

        window.ethereum.on('accountsChanged', handleAccountsChanged);

      } catch (error) {
        // Connection failed or user rejected the request
        console.error(error);
      }
    } else {
      // MetaMask not installed
      console.error('MetaMask not detected');
    }
  };

  const handleConnect = async () => {
    console.log("In handleConnect");
    // Logic to connect and retrieve the account
    await connectWallet();
  };
  function handleDisconnect (){
    console.log("In handleDisconnect");
    if (window.ethereum && window.ethereum.isMetaMask) {
      setAccounts([])
      setSigner(null)
      setProvider(null)
      console.log('Disconnected from MetaMask');
    }
  };
  
 

// eth_accounts always returns an array.
function handleAccountsChanged(_accounts: string[]) {
  if (_accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts.
    handleDisconnect()
    console.log('Please connect to MetaMask.');
  } else if (_accounts[0] !== accounts[0]) {
    // Reload your interface with accounts[0].
    setAccounts(_accounts);
  }
}

  return (
    <AccountContext.Provider value={{ accounts, signer, provider, handleConnect,handleDisconnect }}>
      {children}
    </AccountContext.Provider>
  );
}
