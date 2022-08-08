import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { getAddressExplorer, shortAddress, showTransactionPopUp } from '../../utils/auxiliary'
import { buyNFT, removeItemFromMarketplace } from '../../utils/interact'
import { ethers } from 'ethers'
import $ from 'jquery'
import useAppContext, { AppContext } from '../Context'
import { ThreeDots } from 'react-loader-spinner'
import toast from 'react-hot-toast'
import { _network } from '../../constants/global'


function NFTsOnSale({ activeItems, refreshFunction }) {

    const { userWallet } = useAppContext()

    const [buyNewNFTLoading, setBuyNewNFTLoading] = useState(false)

    const onBuyPressed = async (nft, elementId) => {

        if (buyNewNFTLoading) return

        setBuyNewNFTLoading({ status: true, nft: nft.id })
        var buyToast = toast.loading("Buying NFT")

        const { success, result, hash } = await buyNFT(nft)

        if (success) {
            toast.success(result, { id: buyToast })
            showTransactionPopUp(hash)
            $(`#${elementId}`).remove()
        } else {
            toast.error(result, { id: buyToast })
        }

        // await refreshFunction("onSale")

        setBuyNewNFTLoading(false)

    }

    return activeItems && (
        activeItems.map((nft, idx) =>
        (
            <div key={idx} id={`nft-collected-${nft.id}`} className="col3 card collect bg-white10 col4-md col6-s" >
                <Image src={`${nft.token.image ? nft.token.image : "https://i.picsum.photos/id/783/428/524.jpg?hmac=JS28xmoAEavzhnclwuFX8j7au8ntR0YKp3paCgxI0NQ"}`} width={428} height={524} />
                <div className="row jc-between spacetop2">
                    <div>
                        <p className="size2 halfwhite">
                            Name
                        </p>
                        <h5 className="size2 bold">{`#${nft.token.tokenId} ${nft.token.name}`}</h5>
                    </div>
                    <div>
                        <p className="size2 halfwhite">
                            Seller
                        </p>
                        <Link href={getAddressExplorer(nft.seller.id)}>
                            <a target={"_blank"}><h5 className="size2 bold">{shortAddress(nft.seller.id)}</h5></a>
                        </Link>
                    </div>
                </div>
                <div className="row jc-between spacetop1">
                    <div>
                        <p className="size2 halfwhite">Price</p>
                        <h5 className="size2 bold"><Image src={_network.logo} width={16} height={16} /> {ethers.utils.formatEther(nft.price.toString())}</h5>
                    </div>
                </div>

                {!userWallet || !nft.seller.id || !userWallet.address || (nft.seller.id != userWallet.address) ?
                    buyNewNFTLoading.status && buyNewNFTLoading.nft == nft.id ?
                        <div className="bid-white size2 white spacetop1 ta-center" style={{ display: "flex", flexDirection: "row", width: "auto" }}>
                            <p style={{ paddingRight: 10 }}>Buying</p>
                            <div style={{ paddingTop: 4 }}>
                                <ThreeDots color="#ffffff" height={30} width={30} />
                            </div>
                        </div>
                        :
                        <a className="bid bg-purple size2 white spacetop2" onClick={() => onBuyPressed(nft, `nft-collected-${nft.id}`)}>Buy</a>
                    :
                    <a className="bid-white size2 ta-center">
                        Your NFT
                    </a>
                }
            </div>
        ))
    )
}

export default NFTsOnSale