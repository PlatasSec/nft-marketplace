import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import {
    getAllNFTsFromSubgraph,
    getMarketplaceItemsSoldFromSubgraph,
    getMarketplaceItemsOnSaleFromSubgraph
} from '../../utils/subgraph'
import { _network } from '../../constants/global'

function Intro({ stats }) {

    return (
        <section id="home" className="spacetop15 spacebottom10">
            <div className="container">
                <div className="row jc-between ai-center col-reverse-s">
                    <div className="col5 col6-md col12-s ta-center-s">
                        <h1 className="size5 bold spacebottom1">
                            Mint, Buy &amp; Sell randmon NFTs on {_network.chainName}
                        </h1>
                        <p className="size2 spacebottom3 halfwhite">
                            Generate random and unique NFTs, buy and sell them on the Marketplace.
                        </p>
                        <div className="row col12 jc-left spacebottom4 jc-evenly-s col12-s">
                            <Link href="/marketplace">
                                <a className="btn bg-purple size2 white spaceright2">Markeplace</a>
                            </Link>
                            <Link href="/profile">
                                <a className="btn bg-white10 size2 white">Your Profile</a>
                            </Link>
                        </div>
                        <div className="row jc-between">
                            <div className="ta-center">
                                <p className="size3 bold">{stats.totalMintedNFTs}</p>
                                <p className="size2 halfwhite">NFTs Minted</p>
                            </div>
                            <div className="ta-center">
                                <p className="size3 bold">{stats.totalNFTsOnSale}</p>
                                <p className="size2 halfwhite">Items on Sale</p>
                            </div>
                            <div className="ta-center">
                                <p className="size3 bold">{stats.totalNFTsSold}</p>
                                <p className="size2 halfwhite">Items Sold</p>
                            </div>
                        </div>
                    </div>
                    <div className="col6 col12-s spacebottom3-s">
                        <img src="/assets/img/heroimage.png" className="img-responsive float" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Intro