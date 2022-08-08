import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { convertToFullDateTime, shortAddress, showTransactionPopUp } from '../../utils/auxiliary'
import { removeItemFromMarketplace, updateItemToMarketplace } from '../../utils/interact'
import { ethers } from 'ethers'
import $ from 'jquery'
import useAppContext from '../Context'
import { ThreeDots } from 'react-loader-spinner'
import toast from 'react-hot-toast'
import { _network } from '../../constants/global'

function NFTsOnSale({ activeItems, refreshFunction }) {

    const { userWallet } = useAppContext()

    const [updateNFTLoading, setUpdateNFTLoading] = useState(false)
    const [cancelItemOrderLoading, setCancelItemOrderLoading] = useState(false)

    const onEditPressed = async (tokenId) => {

        $(`#update-section-${tokenId}`).css('display') == 'none' ?
            $(`#update-section-${tokenId}`).css('display', '') :
            $(`#update-section-${tokenId}`).css('display', 'none')

    };

    const onUpdatePressed = async (item, newPrice) => {

        if (updateNFTLoading) return

        if (!newPrice || newPrice == 0 || newPrice < 0) {
            toast.error("Please, enter a valid amount.")
            return
        }
        setUpdateNFTLoading({ status: true, item: item.id })

        var editToast = toast.loading("Updating the price of your NFT")

        newPrice = ethers.utils.parseEther(newPrice)

        if (item.price == newPrice) {
            toast.error("New price must be different than the current one. Please, enter a valid amount and try again.", { id: editToast })
        } else {
            console.log(item)
            const { success, result, hash } = await updateItemToMarketplace(item, newPrice)
            if (success) {
                toast.success(result, { id: editToast })
                showTransactionPopUp(hash)
                await refreshFunction()
                $(`#update-section-${item.token.tokenId}`).css('display', 'none')
            } else {
                toast.error(result, { id: editToast })
            }
        }

        setUpdateNFTLoading(false)

    }

    const onCancelItemOrderPressed = async (item, itemCardId) => {


        if (cancelItemOrderLoading) return

        const itemElement = $(`#${itemCardId}`)

        var cancelToast = toast.loading("Removing your NFT from the marketplace")
        setCancelItemOrderLoading({ status: true, item: item.id })

        const { success, result, hash } = await removeItemFromMarketplace(item)

        if (success) {
            toast.success(result, { id: cancelToast })
            showTransactionPopUp(hash)
            if ($(`#${itemCardId}`).length > 0) itemElement.css('display', 'none')
        } else {
            toast.error(result, { id: cancelToast })
        }
        // await refreshFunction("onSale")

        setCancelItemOrderLoading(false)

    };

    return activeItems && (

        activeItems.map((nft, idx) =>
        (
            <div key={idx} id={`item-onSale-${nft.id}`} className="col3 card collect bg-white10 col4-md col6-s">
                <Image src={`${nft.token.image ? nft.token.image : "https://i.picsum.photos/id/862/428/524.jpg?hmac=GC9sWxTpSE85ADFLo0U1mSTNBqeThsThXhwjur8fLhQ"}`} width={428} height={524} />
                <div className="row jc-between spacetop2">
                    <div>
                        <p className="size2 halfwhite">
                            Name
                        </p>
                        <h5 className="size1-7 bold">{`#${nft.token.tokenId} ${nft.token.name}`}</h5>
                    </div>
                    <div>
                        <p className="size2 halfwhite">Price</p>
                        <div className='row jc-center'>
                            <div className='spacetop1'>
                                <Image src={_network.logo} width={18} height={18} />
                            </div>
                            <div>
                                <h5 className="size2 bold spaceleft1"> {ethers.utils.formatEther(nft.price.toString())}</h5>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="row jc-between spacebottom1 spacetop2 jc-evenly-s col12-s">
                    <a className={`btn ${updateNFTLoading.status || cancelItemOrderLoading.status ? "bg-white10" : "bg-purple"} size2 white`} onClick={!updateNFTLoading.status && !cancelItemOrderLoading.status ? () => onEditPressed(nft.token.tokenId) : undefined}>Edit</a>
                    {cancelItemOrderLoading.status && cancelItemOrderLoading.item == nft.id ?
                        <div className="btn bg-white10 size2 white spacetop1 ta-center" style={{ display: "flex", flexDirection: "row", width: "auto" }}>
                            <p style={{ paddingRight: 10 }}>Removing</p>
                            <div style={{ paddingTop: 4 }}>
                                <ThreeDots color="#ffffff" height={30} width={30} />
                            </div>
                        </div>
                        :
                        <a className="btn bg-white10 size2 white" onClick={!updateNFTLoading.status && !cancelItemOrderLoading.status ? () => onCancelItemOrderPressed(nft, `item-onSale-${nft.id}`) : undefined}>Remove</a>
                    }
                </div>
                <div id={`update-section-${nft.token.tokenId}`} className="row jc-around spacetop2 jc-evenly-s" style={{ display: 'none' }}>
                    <form className="search-form">
                        <label htmlFor="search-box" className="fas fa-search" />
                        <input type="number" id={`input-update-${nft.token.tokenId}`} placeholder="Enter new price" />
                    </form>
                    {updateNFTLoading.status && updateNFTLoading.item == nft.id ?
                        <div className="btn bg-white10 size2 white spacetop1 ta-center" style={{ display: "flex", flexDirection: "row", width: "auto" }}>
                            <p style={{ paddingRight: 10 }}>Updating</p>
                            <div style={{ paddingTop: 4 }}>
                                <ThreeDots color="#ffffff" height={30} width={30} />
                            </div>
                        </div>
                        :
                        <a className="btn bg-purple size2 white spacetop2" onClick={() => onUpdatePressed(nft, $(`#input-update-${nft.token.tokenId}`).val())}>Update</a>
                    }
                </div>

            </div>
        ))
    )
}

export default NFTsOnSale