import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { shortAddress } from '../../utils/auxiliary'
import Pagination from '../pagination/Pagination'
import { shortDescription } from '../../utils/auxiliary'
import { Puff } from 'react-loader-spinner'
import { getOwnerTokenExplorer } from '../../utils/auxiliary'

function Collections({ allNFTs }) {

    const [currentNFTs, setCurrentNFTs] = useState(allNFTs)

    return (
        <section className="collections spacer10" id="collections">
            <div className="container">
                <h1 className="bold size4 ta-center">Collection</h1>
                <p className="spacebottom3 halfwhite size2 ta-center">
                    Check all the random NFTs that have already<br />been minted.
                </p>
                {currentNFTs ?
                    <div className="row box-card jc-evenly-md">
                        {currentNFTs.map((nft, idx) =>
                        (
                            <div key={idx} className="col3 card collect bg-white10 col4-md col6-s" data-item="art">
                                <Image src={nft.image != null ? nft.image : "https://i.picsum.photos/id/783/428/524.jpg?hmac=JS28xmoAEavzhnclwuFX8j7au8ntR0YKp3paCgxI0NQ"} width={428} height={524} style={{ borderRadius: 10 }} />
                                <div className="row jc-between spacetop2">
                                    <div>
                                        <h5 className="size2 bold">#{nft.tokenId} {nft.name ? nft.name : "-"}</h5>
                                        <Link href={getOwnerTokenExplorer(nft.nftContract, nft.owner.id)}>
                                            <a target={"_blank"} className="size2 halfwhite">
                                                Owner: {nft.owner.id && shortAddress(nft.owner.id)}
                                            </a>
                                        </Link>
                                    </div>
                                    <div>
                                        <p className="current halfwhite">{nft.description ? shortDescription(nft.description) : ""}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                    :
                    <div className='row jc-center'>
                        <Puff color="#B75CFF" height={60} width={60} />
                    </div>
                }

                <Pagination allItemsArray={allNFTs} filteredArray={currentNFTs} perPage={4} updateArrayState={setCurrentNFTs} />

            </div>
        </section>
    )
}

export default Collections

