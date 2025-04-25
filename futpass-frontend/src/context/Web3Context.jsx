import React, { createContext, useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import ticketAbi from "../../abi/TicketNFT.json";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          process.env.REACT_APP_CONTRACT_ADDRESS,
          ticketAbi,
          signer
        );

        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        setAccount(accounts[0]);
      } catch (error) {
        setError("Erro ao conectar a MetaMask. Tente novamente.");
        console.error("Erro ao conectar wallet:", error);
      }
    } else {
      setError("MetaMask não encontrado. Instale o MetaMask.");
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{ provider, signer, contract, account, connectWallet, error }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  return useContext(Web3Context);
};
