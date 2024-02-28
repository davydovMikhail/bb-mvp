import { provider } from "../utils/provider";
import { useCallback } from "react"; 
import { Contract } from "ethers";
import GameAbi from '../abi/Game.json';
import { formatEther } from '@ethersproject/units'
const addressGame = process.env.REACT_APP_GAME_CONTRACT as string;
const contractGame = new Contract(addressGame, GameAbi, provider);

export const useGetRewardAmount = () => {

    return useCallback(
        async (account: string) => {  
            try {
                const reward = await contractGame.calculateRewardAmount(account);
                return Number(formatEther(reward));
            } catch(error: any) {
                const errorMessage =
                    error?.error?.message ||
                    error?.message ||
                    "Check console logs for error";
                console.error(error);
                console.error(errorMessage);
            } 
        }
        ,[]
    );
}