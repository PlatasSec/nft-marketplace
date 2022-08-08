import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { convertToFullDateTime, shortAddress, getAddressExplorer } from '../../utils/auxiliary'
import { ethers } from 'ethers'
import { _network } from '../../constants/global'

function NFTsSold({ activeItems }) {

    return activeItems && (
        activeItems.map((nft, idx) =>
        (
            <div key={idx} className="col3 card collect bg-white10 col4-md col6-s" >
                <Image src={`${nft.token.image ? nft.token.image : "https://i.picsum.photos/id/783/428/524.jpg?hmac=JS28xmoAEavzhnclwuFX8j7au8ntR0YKp3paCgxI0NQ"}`} width={428} height={524} />
                <div className="row jc-between spacetop2">
                    <div>
                        <p className="size2 halfwhite"> Name </p>
                        <h5 className="size2 bold">{`#${nft.token.tokenId} ${nft.token.name}`}</h5>
                    </div>
                    <div>
                        <p className="size2 halfwhite">Price</p>
                        <h5 className="size2 bold"><Image src={_network.logo} width={16} height={16} /> {ethers.utils.formatEther(nft.price.toString())}</h5>
                    </div>

                </div>
                <div className="row jc-between spacetop1">
                    <div>
                        <p className="size2 halfwhite">Seller</p>
                        <Link href={getAddressExplorer(nft.seller.id)}>
                            <a target={"_blank"}><h5 className="size2 bold">{shortAddress(nft.seller.id)}</h5></a>
                        </Link>
                    </div>
                    <div>
                        <p className="size2 halfwhite">Buyer</p>
                        <Link href={getAddressExplorer(nft.buyer.id)}>
                            <a target={"_blank"}><h5 className="size2 bold">{shortAddress(nft.buyer.id)}</h5></a>
                        </Link>
                    </div>
                </div>
                <div className="row jc-between spacetop1">
                    <div>
                        <p className="size2 halfwhite">Sale Date</p>
                        <h5 className="size2 bold">{convertToFullDateTime(nft.soldAt)}</h5>
                    </div>
                </div>
            </div>
        ))
    )
}

export default NFTsSold