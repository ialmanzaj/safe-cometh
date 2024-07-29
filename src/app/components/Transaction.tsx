"use client";

import { Icons } from "../lib/ui/components";
import { TransactionReceipt } from "@ethersproject/providers";
import React, { useEffect, useState } from "react";
import { useWalletAuth } from "../modules/wallet/hooks/useWalletAuth";
import Alert from "../lib/ui/components/Alert";
import { PlusIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { RelayTransactionResponse, ComethProvider } from "@cometh/connect-sdk";
import { useWindowSize } from "../lib/ui/hooks/useWindowSize";
import Confetti from "react-confetti";
import { Hex } from "viem";
import { useAccount, useBalance } from "wagmi";
import { encodeFunctionData, parseAbiItem } from "viem";
import { toUsdcString } from "../lib/utils/usdc";

interface TransactionProps {
  transactionSuccess: boolean;
  setTransactionSuccess: React.Dispatch<React.SetStateAction<boolean>>;
}

const transferUserOps = (
  from: string,
  recipient: string,
  amount: number,
  usdcAddress: string,
) => {
  const transaction = {
    from: from as Hex,
    to: usdcAddress as Hex,
    value: "0x00",
    data: encodeFunctionData({
      abi: [
        parseAbiItem(
          "function transfer(address recipient, uint256 amount) returns (bool)"
        ),
      ],
      functionName: "transfer",
      args: [recipient as Hex, BigInt(amount * 1e6)],
    })
  };
  return transaction;
};

export function Transaction({
  transactionSuccess,
  setTransactionSuccess,
}: TransactionProps) {
  const { wallet, counterContract, usdcContract } = useWalletAuth();
  const [isTransactionLoading, setIsTransactionLoading] =
    useState<boolean>(false);
  const [isSendLoading, setIsSendLoading] = useState<boolean>(false);
  const [transactionSended, setTransactionSended] =
    useState<RelayTransactionResponse | null>(null);
  const [transactionResponse, setTransactionResponse] =
    useState<TransactionReceipt | null>(null);
  const [transactionFailure, setTransactionFailure] = useState(false);
  const [nftBalance, setNftBalance] = useState<number>(0);




  function TransactionButton({
    sendTestTransaction,
    isTransactionLoading,
  }: {
    sendTestTransaction: () => Promise<void>;
    isTransactionLoading: boolean;
  }) {
    return (
      <button
        className="mt-1 flex h-11 py-2 px-4 gap-2 flex-none items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200"
        onClick={sendTestTransaction}
      >
        {isTransactionLoading ? (
          <Icons.spinner className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <PlusIcon width={16} height={16} />
          </>
        )}{" "}
        Increment counter
      </button>
    );
  }

  function SendButton({
    sendTestTransaction,
    isTransactionLoading,
  }: {
    sendTestTransaction: () => Promise<void>;
    isTransactionLoading: boolean;
  }) {
    return (
      <button
        className="mt-1 flex h-11 py-2 px-4 gap-2 flex-none items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200"
        onClick={sendTestTransaction}
      >
        {isTransactionLoading ? (
          <Icons.spinner className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <ArrowRightIcon width={16} height={16} />
          </>
        )}{" "}
        Send USDC
      </button>
    );
  }

  const refreshBalance = async () => {
    if (wallet && usdcContract) {
      const balance = ((await usdcContract.balanceOf(wallet.getAddress())) / 10 ** 6).toString();
      setNftBalance(Number(balance));
    }
  };

  useEffect(() => {
    if (wallet) {
      refreshBalance();

    }
  }, [wallet, usdcContract]);

  const sendTestTransaction = async () => {
    setTransactionSended(null);
    setTransactionResponse(null);
    setTransactionFailure(false);
    setTransactionSuccess(false);

    setIsTransactionLoading(true);
    try {
      if (!wallet) throw new Error("No wallet instance");

      const tx: RelayTransactionResponse = await counterContract!.count();
      setTransactionSended(tx);

      const txResponse = await tx.wait();

      const balance = await counterContract!.counters(wallet.getAddress());
      setNftBalance(Number(balance));

      setTransactionResponse(txResponse);
      setTransactionSuccess(true);
    } catch (e) {
      console.log("Error:", e);
      setTransactionFailure(true);
    }

    setIsTransactionLoading(false);
  };

  const sendUSDC = async () => {
    setTransactionSended(null);
    setTransactionResponse(null);
    setTransactionFailure(false);
    setTransactionSuccess(false);

    setIsSendLoading(true);
    try {
      if (!wallet) throw new Error("No wallet instance");

      const provider = new ComethProvider(wallet!)

      const txParams = transferUserOps(wallet.getAddress(),
        "0x02C48c159FDfc1fC18BA0323D67061dE1dEA329F",
        1,
        "0x036CbD53842c5426634e7929541eC2318f3dCF7e")

      const tx = await wallet.sendTransaction(txParams);
      const txPending = await provider.getTransaction(tx.safeTxHash);
      const txReceipt = await txPending.wait();

      //setNftBalance(Number(balance));

      setTransactionResponse(txReceipt);
      setTransactionSuccess(true);

      await refreshBalance();
    } catch (e) {
      console.log("Error:", e);
      setTransactionFailure(true);
    }

    setIsSendLoading(false);
  };

  return (
    <main>
      <div className="p-4">
        <p className="text-center text-3xl">{nftBalance}</p>
        <div className="relative flex items-center gap-x-6 rounded-lg p-4">

          {/*  <TransactionButton
            sendTestTransaction={sendTestTransaction}
            isTransactionLoading={isTransactionLoading}
          /> */}
          <SendButton
            sendTestTransaction={sendUSDC}
            isTransactionLoading={isSendLoading}
          />

        </div>
      </div>
      {transactionSended && !transactionResponse && (
        <Alert
          state="information"
          content="Transaction in progress.. (est. time 10 sec)"
        />
      )}
      {transactionSuccess && (
        <Alert
          state="success"
          content="Transaction confirmed !"
          link={{
            content: "Go see your transaction",
            url: `${process.env.NEXT_PUBLIC_SCAN_URL}tx/${transactionResponse?.transactionHash}`,
          }}
        />
      )}
      {transactionFailure && (
        <Alert state="error" content="Transaction Failed !" />
      )}
    </main>
  );
}
