import React from 'react'
import Image from 'next/image';
import { shortAddress, convertToFullDateTime } from '../../utils/auxiliary'
import { ethers } from 'ethers'
import { _network } from '../../constants/global'

function NFTsSold({ activeItems }) {
    return (
        activeItems.map((nft, idx) =>
        (
            <div key={idx} className="col3 card collect bg-white10 col4-md col6-s">
                <Image src={`${nft.token.image ? nft.token.image : "https://i.picsum.photos/id/862/428/524.jpg?hmac=GC9sWxTpSE85ADFLo0U1mSTNBqeThsThXhwjur8fLhQ"}`} width={428} height={524} />
                <div className="row jc-between spacetop2">
                    <div>
                        <p className="size2 halfwhite">
                            Name
                        </p>
                        <h5 className="size2 bold">{`#${nft.token.id} ${nft.token.name}`}</h5>
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
                <div className="column jc-between">
                    <div>
                        <p className="size2 halfwhite">
                            Buyer
                        </p>
                        <h5 className="size2 bold">{shortAddress(nft.buyer.id)}</h5>
                    </div>
                    <div>
                        <p className="size2 halfwhite">
                            Sale Date
                        </p>
                        <h5 className="size2 bold">{convertToFullDateTime(nft.soldAt)}</h5>
                    </div>
                </div>
            </div>

        ))
    )
}

export default NFTsSold