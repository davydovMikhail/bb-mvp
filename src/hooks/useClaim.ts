import { useEthers, BSCTestnet } from "@usedapp/core";
import { useCallback } from "react";
import { useContracts } from "./useContracts";
import { toast } from "react-toastify";

export const useClaim = () => {
  const { GameContract } = useContracts();
  const { switchNetwork, account } = useEthers();

  return useCallback(
    async (address: string) => {
      if (!GameContract) return;
      await switchNetwork(BSCTestnet.chainId);
      try {
        const txPromise = await GameContract.claim(address);
        const tx = await txPromise.wait();
        toast.success('Claimed', {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: true,
            pauseOnHover: false,
            draggable: true,
            theme: "colored",
        });
        return tx;
      } catch (error: any) {
        const errorMessage =
          error?.error?.message ||
          error?.message ||
          "Check console logs for error";
        console.error(error);
        console.error(errorMessage);
        toast.error('Err! See console', {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: true,
            pauseOnHover: false,
            draggable: true,
            theme: "colored",
        });
      }
    },
    [GameContract, switchNetwork, account]
  );
};