import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { convertToFullDateTime, showTransactionPopUp } from '../../utils/auxiliary'
import { checkIfApproved, addNFTToMarketplace, approveToMarketplace } from '../../utils/interact'
import { ethers } from 'ethers'
import $ from 'jquery'
import useAppContext from '../Context'
import { ThreeDots } from 'react-loader-spinner'
import toast from 'react-hot-toast'

function NFTsCollected({ activeItems, refreshFunction }) {

    const { userWallet, setUserWallet } = useAppContext();

    const [approveNFTLoading, setApproveNFTLoading] = useState(false)
    const [sellNFTLoading, setSellNFTLoading] = useState(false)

    const onApprovePressed = async (tokenId) => {

        if (approveNFTLoading || !tokenId) return

        setApproveNFTLoading(true)
        var approveToast = toast.loading("Approving the marketplace")

        const { success, result } = await checkIfApproved(tokenId)
        if (success) {
            toast.success("You already approved. Please, now click the SELL button.", { id: approveToast })
            let prevUserWallet = Object.assign({}, userWallet)
            prevUserWallet.isApproved = true
            setUserWallet(prevUserWallet)
        } else {
            const approveRequest = await approveToMarketplace(tokenId)
            if (approveRequest.success) {
                toast.success(approveRequest.result, { id: approveToast })
                let prevUserWallet = Object.assign({}, userWallet)
                prevUserWallet.isApproved = true
                setUserWallet(prevUserWallet)
            } else {
                toast.error(result, { id: approveToast })
            }
        }
        setApproveNFTLoading(false)
    };

    const onSellPressed = async (tokenId) => {

        const { success, result } = await checkIfApproved(tokenId)
        if (!success) return toast.error("You must approve first.")

        $(`#sell-section-${tokenId}`).css('display') == 'none' ?
            $(`#sell-section-${tokenId}`).css('display', '') :
            $(`#sell-section-${tokenId}`).css('display', 'none')

    }

    const onSubmitSellPressed = async (nft, nftCardId) => {


        const nftElement = $(`#${nftCardId}`)
        const inputPrice = nftElement.find('.input-sell')
        const price = inputPrice.val()

        if (!inputPrice || !price || price < 0 || isNaN(price)) {
            toast.error("Please enter a valid price.")
            return
        }

        if (sellNFTLoading || !nftElement) return

        setSellNFTLoading({ status: true, nft: nft.id })
        var sellToast = toast.loading("Listing your NFT on the marketplace")

        if (!price || price < 0) {
            toast.error("Please enter a valid price.", { id: sellToast })
        } else {
            price = ethers.utils.parseEther(price)
            const { success, result, hash } = await addNFTToMarketplace(nft, price)

            if (success) {
                toast.success(result, { id: sellToast })
                showTransactionPopUp(hash)
                if ($(`#${nftCardId}`).length > 0) nftElement.css('display', 'none')
            } else {
                toast.error(result, { id: sellToast })
            }
            // await refreshFunction("collected")
        }

        setSellNFTLoading(false)

    }

    return activeItems && (
        activeItems.map((nft, idx) =>
        (
            <div key={idx} id={`nft-collected-${nft.id}`} className="col3 card collect bg-white10 col4-md col6-s">
                <div style={{ borderRadius: 12 }}>
                    <Image src={nft.image != null ? nft.image : "https://i.picsum.photos/id/862/428/524.jpg?hmac=GC9sWxTpSE85ADFLo0U1mSTNBqeThsThXhwjur8fLhQ"} width={428} height={524} />
                </div>
                <div className="column jc-between spacetop2">
                    <div>
                        <p className="size2 halfwhite">
                            Name
                        </p>
                        <h5 className="size2 bold">{`#${nft.id} ${nft.name}`}</h5>
                    </div>
                    <div>
                        <p className="size2 halfwhite"> Minting Date </p>
                        <h5 className="size2 bold">{convertToFullDateTime(nft.createdAt)}</h5>
                    </div>
                </div>
                {userWallet.isApproved ?
                    <>
                        <div className="row jc-around spacetop2 jc-evenly-s">
                            <a className={`btn ${sellNFTLoading.status ? "bg-white10" : "bg-purple"} bg-white10 size2 white sell-${nft.tokenId}`}
                                onClick={!sellNFTLoading.status ? () => onSellPressed(nft.tokenId) : undefined}>Sell</a>
                        </div>
                        <div id={`sell-section-${nft.tokenId}`} className="row jc-around spacetop2 jc-evenly-s sell-section" style={{ display: 'none' }}>
                            <form className="search-form">
                                <label htmlFor="search-box" />
                                <input type="number" className='input-sell' id={`input-sell-${nft.tokenId}`} placeholder="Enter new price" />
                            </form>
                            {sellNFTLoading.status && sellNFTLoading.nft == nft.id ?
                                <div className="btn bg-white10 size2 white spacetop1 ta-center" style={{ display: "flex", flexDirection: "row", width: "auto" }}>
                                    <p style={{ paddingRight: 10 }}>Submiting</p>
                                    <div style={{ paddingTop: 4 }}>
                                        <ThreeDots color="#ffffff" height={30} width={30} />
                                    </div>
                                </div>
                                :
                                <a className="btn bg-purple size2 white spacetop2" onClick={() => onSubmitSellPressed(nft, `nft-collected-${nft.id}`)}>Submit</a>
                            }
                        </div>
                    </>
                    :
                    <div className="row jc-around spacetop2 jc-evenly-s">
                        <a className={`btn bg-purple size2 white approve-${nft.tokenId}`} onClick={() => onApprovePressed(nft.tokenId)}>Approve</a>
                        <a className={`btn bg-white10 size2 white sell-${nft.tokenId}`} onClick={() => onSellPressed(nft.tokenId)}>Sell</a>
                    </div>
                }
            </div>
        ))
    )
}

export default NFTsCollected