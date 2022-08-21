import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { ethers } from 'ethers'
import { _network } from '../../constants/global'
import { withdraw } from '../../utils/interact'
import toast from 'react-hot-toast'
import { GiReceiveMoney } from "react-icons/gi"
import { showTransactionPopUp } from '../../utils/auxiliary'
import useAppContext from '../Context'

function EarningsTable({ earnings, refreshFunction }) {

    const { userWallet, setUserWallet } = useAppContext()
    const [withdrawLoading, setWithdrawLoading] = useState(false)

    const onWithdrawPressed = async () => {


        if (withdrawLoading) return

        setWithdrawLoading(true)
        var withdrawToast = toast.loading("Withdrawing your earnings")
        
        const { success, result, hash } = await withdraw()

        if (success) {
            toast.success(result, { id: withdrawToast })
            showTransactionPopUp(hash)
            // Update user earnings on state variable
            var prevUserWallet = structuredClone(userWallet);
            prevUserWallet.earnings.withdrawn = parseFloat(ethers.utils.formatEther(userWallet.earnings.withdrawn)) + parseFloat(ethers.utils.formatEther(userWallet.earnings.pendingToWithdraw))
            prevUserWallet.earnings.pendingToWithdraw = 0
            setUserWallet(prevUserWallet)
        } else {
            toast.error(result, { id: withdrawToast })
        }

        // await refreshFunction()

        setWithdrawLoading(false)

    };

    return (
        <table>
            <tbody className="jc-center">
                <tr>
                    <th className="size2 size1-md">Spent</th>
                    <th className="size2 size1-md">Pending To Withdraw</th>
                    <th className="size2 size1-md">Witdrawn</th>
                </tr>
                {earnings ?
                    <tr className="jc-center">
                        <td className="size2 halfwhite jc-center">
                            <div className='row jc-center'>
                                <div className='spaceright1'>
                                    <Image src={_network.logo} width={20} height={20} />
                                </div>
                                <div className="halfwhite size2 size1-md">{earnings.deposited && earnings.deposited > 0 ? ethers.utils.formatEther(earnings.deposited) : "0"} </div>
                            </div>
                        </td>
                        <td className={`size2 size1-md jc-center ${(!earnings.pendingToWithdraw || earnings.pendingToWithdraw == 0) ? "halfwhite" : "text-link"}`}>
                            <div className='row jc-center'>
                                {earnings.pendingToWithdraw && earnings.pendingToWithdraw > 0 ?
                                    <>
                                        <div className='spaceright1'><Image src={_network.logo} width={20} height={20} /></div>
                                        <div className='spaceright1'>{earnings.pendingToWithdraw && earnings.pendingToWithdraw > 0 ? ethers.utils.formatEther(earnings.pendingToWithdraw) : 0}</div>
                                        <div><GiReceiveMoney title={"Withdraw Payments"} className='spaceright1 text-link' color={"#B75CFF"} style={{ cursor: "pointer" }} onClick={() => onWithdrawPressed()} /></div>
                                    </> :
                                    <>
                                        <div className='spaceright1'><Image src={_network.logo} width={20} height={20} /></div>
                                        <div className='spaceright1'>0</div>
                                    </>
                                }
                            </div>

                        </td>
                        <td className="size2 size1-md halfwhite jc-center">
                            <div className='row jc-center'>
                                <div className='spaceright1'>
                                    <Image src={_network.logo} width={20} height={20} />
                                </div>
                                <div className="halfwhite size2 size1-md">{earnings.withdrawn && earnings.withdrawn > 0 ? ethers.utils.formatEther(earnings.withdrawn) : "0"} </div>
                            </div>
                        </td>
                    </tr>
                    :
                    <tr className="jc-center">
                        <td className="size2 halfwhite jc-center">
                            <div className='row jc-center'>
                                <div className='spaceright1'>
                                    <Image src={_network.logo} width={20} height={20} />
                                </div>
                                <div className="halfwhite size2 size1-md">0</div>
                            </div>
                        </td>
                        <td className="size2 halfwhite jc-center">
                            <div className='row jc-center'>
                                <div className='spaceright1'>
                                    <Image src={_network.logo} width={20} height={20} />
                                </div>
                                <div className="halfwhite size2 size1-md">0</div>
                            </div>
                        </td>
                        <td className="size2 halfwhite jc-center">
                            <div className='row jc-center'>
                                <div className='spaceright1'>
                                    <Image src={_network.logo} width={20} height={20} />
                                </div>
                                <div className="halfwhite size2 size1-md">0</div>
                            </div>
                        </td>
                    </tr>
                }
            </tbody>
        </table>
    )
}

export default EarningsTable