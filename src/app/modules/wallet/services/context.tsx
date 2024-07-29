"use client";
import { ComethProvider, ComethWallet } from "@cometh/connect-sdk";
import { ethers } from "ethers";
import { createContext, Dispatch, SetStateAction, useState } from "react";

export const WalletContext = createContext<{
  wallet: ComethWallet | null;
  setWallet: Dispatch<SetStateAction<ComethWallet | null>>;
  provider: ComethProvider | null;
  setProvider: Dispatch<SetStateAction<ComethProvider | null>>;
  counterContract: ethers.Contract | null;
  setCounterContract: Dispatch<SetStateAction<any | null>>;
  usdcContract: ethers.Contract | null;
  setUsdcContract: Dispatch<SetStateAction<ethers.Contract | null>>;
}>({
  wallet: null,
  setWallet: () => {},
  provider: null,
  setProvider: () => {},
  counterContract: null,
  setCounterContract: () => {},
  usdcContract: null,
  setUsdcContract: () => {},
});

export function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [wallet, setWallet] = useState<ComethWallet | null>(null);
  const [provider, setProvider] = useState<ComethProvider | null>(null);
  const [counterContract, setCounterContract] =
    useState<ethers.Contract | null>(null);
  const [usdcContract, setUsdcContract] = useState<ethers.Contract | null>(null);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        setWallet,
        provider,
        setProvider,
        usdcContract,
        setUsdcContract,
        counterContract,
        setCounterContract,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
