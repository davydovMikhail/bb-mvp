import { useState, useEffect, useRef } from 'react'
import { useEthers } from "@usedapp/core";
import { useGetBalance } from '../hooks/useGetBalance';
import { useClaimTestTokens } from '../hooks/useClaimTestTokens';
import { useGetAllowance } from '../hooks/useGetAllowance';
import { toast } from "react-toastify";
import { useActions } from '../hooks/useActions';
import { useGetRechargingLevel } from '../hooks/useGetRechargingLevel';
import { useGetBankLevel } from '../hooks/useGetBankLevel';
import { useGetMandatoryBalance } from '../hooks/useGetMandatoryBalance';
import { useGetRewardAmount } from '../hooks/useGetRewardAmount';
import { useClaim } from '../hooks/useClaim';
import { useApproveToGame } from '../hooks/useApproveToGame';
import { useBoostEnergy } from '../hooks/useBoostEnergy';
import { useBoostRecharging } from '../hooks/useBoostRecharging';
import { useGetReferral } from '../hooks/useGetReferral';
import useSetInterval from "use-set-interval"


const Main = () => {
    const { activateBrowserWallet, account } = useEthers();
    const { SetNotification, SetLoader, SetShowOk } = useActions();

    const [balance, setBalance] = useState(0);
    const [bankLevel, setBankLevel] = useState(0);
    const [rechargingLevel, setRechargingLevel] = useState(0);
    const [mandatoryBalance, setMandatoryBalance] = useState(0);
    const [reward, setReward] = useState(0);
    const [referral, setReferral] = useState("");
    const [factReferral, setFactReferral] = useState("0x0000000000000000000000000000000000000000");

    const approveHook = useApproveToGame();
    const getBalanceHook = useGetBalance();
    const claimHook = useClaimTestTokens();
    const allowanceHook = useGetAllowance();
    const rechargingHook = useGetRechargingLevel();
    const bankHook = useGetBankLevel();
    const mandatoryHook = useGetMandatoryBalance();
    const rewardHook = useGetRewardAmount();
    const claimRewardHook = useClaim();
    const boostBankHook = useBoostEnergy();
    const boostRechargingHook = useBoostRecharging();
    const referralHook = useGetReferral();
 
    useSetInterval(() => {
        if(reward + rechargingSpeed() < bankSize()) {
            setReward(reward + rechargingSpeed())
        }
    }, 1000)

    useEffect(() => {
        const fetchData = async () => {
            const refer = await referralHook(account as string);
            setFactReferral(refer);
            const balanceAccount = await getBalanceHook(account as string);   
            setBalance(balanceAccount as number);
            const mandatoryBal = await mandatoryHook(account as string);
            setMandatoryBalance(mandatoryBal as number);
            const rechargingLevel = await rechargingHook(account as string);
            setRechargingLevel(rechargingLevel as number);
            const bankLevel = await bankHook(account as string);
            setBankLevel(bankLevel as number);
            const rewardAmount = await rewardHook(account as string);
            setReward(rewardAmount as number);
        }
        fetchData().catch(console.error);
    }, [account]);

    async function handleClaim() {
        if (!account) {
            toast.info('First connect your wallet', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: true,
                pauseOnHover: false,
                draggable: true,
                theme: "colored",
            });
            return;
        }
        SetLoader(true);
        await claimHook();
        SetLoader(false);
        const balanceAccount = await getBalanceHook(account as string);               
        setBalance(balanceAccount as number);
    }

    function bankSize() {
        return (bankLevel * 5000 + 10000);
    }

    function rechargingSpeed() {
        return (rechargingLevel + 1);
    }

    function getWidth2() {
        return (reward / bankSize()) * 100;
    }

    function boostPrice(level: number) {
        let price = 1000 * (2**(level + 1));
        return price;
    }

     
    function isValidETHAddress(address: string) {
        if(address.length !== 42) {
            return false;
        }
        let regex = new RegExp(/^(0x)?[0-9a-fA-F]{40}$/);
        return regex.test(address); 
    }

    async function takeaway() {
        if (!account) {
            toast.info('First connect your wallet', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: true,
                pauseOnHover: false,
                draggable: true,
                theme: "colored",
            });
            return;
        }
        SetLoader(true);
        let address = referral.trim();
        if(address === '') {
            address = "0x0000000000000000000000000000000000000000"
        } else {
            const valid = isValidETHAddress(address);
            if(!valid) {
                toast.error('Invalid address', {
                    position: "top-center",
                    autoClose: 1000,
                    hideProgressBar: true,
                    pauseOnHover: false,
                    draggable: true,
                    theme: "colored",
                });
                SetLoader(false);
                return;
            } else {
                if(address.toLocaleUpperCase() === account.toLocaleUpperCase()) {
                    toast.info('you cannot specify your address as a referral', {
                        position: "top-center",
                        autoClose: 1000,
                        hideProgressBar: true,
                        pauseOnHover: false,
                        draggable: true,
                        theme: "colored",
                    });
                    SetLoader(false);
                    return;
                }
            }
        }
        console.log(address);
        await claimRewardHook(address);
        SetLoader(false);
        const balanceAccount = await getBalanceHook(account as string);               
        setBalance(balanceAccount as number);
        const mandatoryBal = await mandatoryHook(account as string);
        setMandatoryBalance(mandatoryBal as number);
        const rewardAmount = await rewardHook(account as string);
        setReward(rewardAmount as number);
        const refer = await referralHook(account as string);
        setFactReferral(refer);
    }

    async function boostBank() {
        if (!account) {
            toast.info('First connect your wallet', {
                position: "bottom-center",
                autoClose: 1000,
                hideProgressBar: true,
                pauseOnHover: false,
                draggable: true,
                theme: "dark",
            });
            return;
        }
        if (balance < boostPrice(bankLevel)) {
            toast.info('Not enough tokens', {
                position: "bottom-center",
                autoClose: 1000,
                hideProgressBar: true,
                pauseOnHover: false,
                draggable: true,
                theme: "dark",
            });
            return;
        }
        SetLoader(true);
        if((await allowanceHook(account) as number) < boostPrice(bankLevel)) {
            SetNotification('Approve your game tokens');
            await approveHook();
        }
        SetNotification('');
        await boostBankHook();
        SetLoader(false);
        const balanceAccount = await getBalanceHook(account as string);   
        setBalance(balanceAccount as number);
        const bankLvl = await bankHook(account as string);
        setBankLevel(bankLvl as number);
        const rewardAmount = await rewardHook(account as string);
        setReward(rewardAmount as number);
    }

    async function boostRecharging() {
        if (!account) {
            toast.info('First connect your wallet', {
                position: "bottom-center",
                autoClose: 1000,
                hideProgressBar: true,
                pauseOnHover: false,
                draggable: true,
                theme: "dark",
            });
            return;
        }
        if (balance < boostPrice(rechargingLevel)) {
            toast.info('Not enough tokens', {
                position: "bottom-center",
                autoClose: 1000,
                hideProgressBar: true,
                pauseOnHover: false,
                draggable: true,
                theme: "dark",
            });
            return;
        }
        SetLoader(true);
        if((await allowanceHook(account) as number) < boostPrice(rechargingLevel)) {
            SetNotification('Approve your game tokens');
            await approveHook();
        }
        SetNotification('');
        await boostRechargingHook();
        SetLoader(false);
        const balanceAccount = await getBalanceHook(account as string);   
        setBalance(balanceAccount as number);
        const rechargingLvl = await rechargingHook(account as string);
        setRechargingLevel(rechargingLvl as number);
        const rewardAmount = await rewardHook(account as string);
        setReward(rewardAmount as number);
    }

    return (
        <>
            <div className="nude">
                <div className="wrapper">
                    <div className="main">
                        <div className="section section-white">
                            <div className="container">
                                <div className="space-top"></div>
                                <div className="row">
                                    <div className="col-md-2">
                                        <button onClick={() => activateBrowserWallet()} type="button" className="btn btn-warning btn-lg">Connect Wallet</button>
                                    </div>
                                    <div className="col-md-2">
                                        <button onClick={() => handleClaim()} type="button" className="btn btn-warning btn-lg">Claim Test Tokens</button>
                                    </div>
                                </div>
                                {account && 
                                    <div className="row">
                                        <div className="col-md-4 h5" >
                                            BALANCE: {balance} BUBBLE
                                        </div>
                                        <div className="col-md-6 h5" >
                                            ADDRESS: {account}
                                        </div>
                                    </div>
                                }
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="tim-container">
                                        <div className="tim-row" id="edit-metric-labels">
                                            {/* <h2>Max possible win: {maxWin} </h2> */}
                                            <legend></legend>
                                            <div className="row">
                                                
                                                <div className="col-md-3">
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="info">
                                                        <div className="info__win">
                                                            {reward}/{bankSize()}
                                                        </div>
                                                        <div className="info__win">
                                                            {mandatoryBalance}
                                                        </div>
                                                        <div className="info__win__title">вы можете забрать</div>
                                                        <div className="info__win__title">у вас должно быть на счету</div>
                                                    </div>
                                                    <div className="choose">
                                                        <div className="choose__var">
                                                            <button 
                                                                className="btn btn-warning btn-lg choose__btn"
                                                                onClick={() => takeaway()}
                                                            >ЗАБРАТЬ</button>
                                                        </div>
                                                    </div>
                                                    <div className="form-group">
                                                        {factReferral === "0x0000000000000000000000000000000000000000" &&
                                                            <input 
                                                                type="string"
                                                                placeholder="referral(не обязательно)" 
                                                                className="form-control border-input"
                                                                value={referral || ''}
                                                                onChange={(e) => setReferral(e.target.value)}
                                                            />  
                                                        }
                                                        {factReferral !== "0x0000000000000000000000000000000000000000" &&
                                                            <div>
                                                                referral: {factReferral}
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row" style={{display: "flex", marginTop: "20px"}}>
                                                    <div className="green" style={{ width:`${getWidth2()}%`}} ></div>
                                                    <div className="blue" style={{ width: `${100 - getWidth2()}%`}} ></div>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                                
                                
                                <div className="row">
                                    <h4>Характеристика банка</h4>
                                    <table className="table__info table__mt">
                                        <tbody>
                                            <tr>
                                                <td className='table__title table__title_darkcyan'>Текущий уровень</td>
                                                <td className='table__title table__title_darkcyan'>Цена буста</td>
                                                <td className='table__title table__title_darkcyan'>Размер Банка</td>
                                            </tr>
                                            <tr>
                                                <td>{bankLevel}</td>
                                                <td>{boostPrice(bankLevel)}</td>
                                                <td>{bankSize()}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="row">
                                    <button 
                                        className="btn btn-warning btn-lg choose__btn"
                                        onClick={() => boostBank()}
                                    >Улучшить банк</button> <p>(+ 5000 токенов к размеру банка)</p>
                                </div>
                                <div className="row">
                                    <h4>Характеристика скорости восстановления</h4>
                                    <table className="table__info table__mt">
                                        <tbody>
                                            <tr>
                                                <td className='table__title table__title_darkcyan'>Текущий уровень</td>
                                                <td className='table__title table__title_darkcyan'>Цена буста</td>
                                                <td className='table__title table__title_darkcyan'>Скорость восстановления(шт/сек)</td>
                                            </tr>
                                            <tr>
                                                <td>{rechargingLevel}</td>
                                                <td>{boostPrice(rechargingLevel)}</td>
                                                <td>{rechargingSpeed()}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="row">
                                    <button 
                                        className="btn btn-warning btn-lg choose__btn"
                                        onClick={() => boostRecharging()}
                                    >Увеличить скорость</button> <p>(+ 1 токен/сек.)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Main;