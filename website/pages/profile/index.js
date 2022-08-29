import Image from 'next/image'
import Link from "next/link"
import React, { useEffect, useState } from 'react'
import { getHolderNFTsOnSale, removeItemFromMarketplace, addNFTToMarketplace, checkIfApproved, approveToMarketplace, getHolderNFTs, nft_contract_address, withdraw } from '../../utils/interact'
import useAppContext from '../../components/Context'
import { convertToFullDateTime, shortAddress, mergerAllHolderTradesIntoOneArray } from '../../utils/auxiliary'
import { ethers } from 'ethers'
import $ from 'jquery'
import { getAllHolderTradesFromSubgraph, getHolderInfoFromSubgraph, getHolderNFTsOnSaleFromSubgraph, getHolderNFTsPurchasedFromSubgraph, getHolderNFTsSoldFromSubgraph, getHolderTradesFromSubgraph } from '../../utils/subgraph'
import toast from 'react-hot-toast'
import { ThreeDots, Puff } from 'react-loader-spinner'
import Pagination from '../../components/pagination/Pagination'
import ActivityTable from '../../components/tables/ActivityTable'
import Head from 'next/head'
import EarningsTable from '../../components/tables/EarningsTable'
import CollectedNFTs from '../../components/profile/NFTsCollected'
import NFTsOnSale from '../../components/profile/NFTsOnSale'
import NFTsPurchased from '../../components/profile/NFTsPurchased'
import NFTsSold from '../../components/profile/NFTsSold'
import { MdUpdate } from "react-icons/md"

export default function Profile() {

    const { userWallet, setUserWallet } = useAppContext()

    const [userDataInitialised, setUserDataInitialised] = useState(false)

    // NFTs
    const [userNFTsLoading, setUserNFTsLoading] = useState(false)
    const [currentItemsArray, setCurrentItemsArray] = useState(false)

    const [activeItems, setActiveItems] = useState(false)
    const [activeFilter, setActiveFilter] = useState(false)

    const [earningsLoading, setEarningsLoading] = useState(false)

    // Trades
    const [trades, setTrades] = useState(false)
    const [tradesLoading, setTradesLoading] = useState(false)

    const [currentTrades, setCurrentTrades] = useState(false)

    useEffect(() => {
        (async () => {
            if (!userWallet || !userWallet.address) return;

            await initialiseUserData("collected")

            setUserDataInitialised(true)

        })()
    }, [userWallet.address])

    useEffect(() => {
        $('.your-nft-filter-button').removeClass('active')
        $(`.your-nft-filter-button+.${activeFilter}`).addClass('active')
    }, [activeItems])


    const initialiseUserData = async (type) => {

        await onEarningsUpdatePressed()
        await onFilterPressed(type)
        await onTradesUpdatePressed()

    }

    const onFilterPressed = async (type) => {

        if (!userWallet || !userWallet.address || userNFTsLoading) return;

        setUserNFTsLoading(true)

        if (type == "collected") {
            const userNFTsRequest = await getHolderNFTs(userWallet.address)
            if (userNFTsRequest.success) {
                setActiveItems({ items: userNFTsRequest.result, filter: type })
                setCurrentItemsArray(userNFTsRequest.result)
            } 

        } else if (type == "purchased") {
            const userNFTsPurchasedRequest = await getHolderNFTsPurchasedFromSubgraph(userWallet.address)
            if (userNFTsPurchasedRequest.success) {
                setActiveItems(userNFTsPurchasedRequest.result)
                setCurrentItemsArray(userNFTsPurchasedRequest.result)

            }
        } else if (type == "onSale") {
            const userNFTsOnSaleRequest = await getHolderNFTsOnSaleFromSubgraph(userWallet.address)
            if (userNFTsOnSaleRequest.success) {
                setActiveItems(userNFTsOnSaleRequest.result)
                setCurrentItemsArray(userNFTsOnSaleRequest.result)

            }

        } else if (type == "sold") {
            const userNFTsSoldRequest = await getHolderNFTsSoldFromSubgraph(userWallet.address)
            if (userNFTsSoldRequest.success) {
                setActiveItems(userNFTsSoldRequest.result)
                setCurrentItemsArray(userNFTsSoldRequest.result)
            }
        } 
        
        setActiveFilter(type)
        setUserNFTsLoading(false)
    }

    const onTradesUpdatePressed = async () => {

        if (!userWallet || !userWallet.address || tradesLoading) return

        setTradesLoading(true)

        const allTradesRequest = await getAllHolderTradesFromSubgraph(userWallet.address)
        if (allTradesRequest.success) {
            const finalTradesResult = mergerAllHolderTradesIntoOneArray(allTradesRequest.result.from, allTradesRequest.result.to)
            if (finalTradesResult.length) setTrades(finalTradesResult)
        }

        setTradesLoading(false)
    }

    const onEarningsUpdatePressed = async () => {

        if (!userWallet || !userWallet.address || earningsLoading) return

        setEarningsLoading(true)

        const holderInfoRequest = await getHolderInfoFromSubgraph(userWallet.address)
        if (holderInfoRequest.success) {
            let updatedUserWallet = Object.assign({}, userWallet)
            updatedUserWallet.earnings = holderInfoRequest.result
            setUserWallet(updatedUserWallet)
        }

        setEarningsLoading(false)
    }

    return (
        <>
            <Head>
                <title>PC Maketplace - Profile</title>
            </Head>
            <section className="collections spacer10" id="yourNFTs">
                <div className="container">
                    <div className="row jc-center">
                        <h1 className="bold size4 ta-center">
                            Your NFTs
                        </h1>
                        {!userNFTsLoading ?
                            <div className="text-link spacetop1 spaceleft1" style={{ cursor: "pointer" }} title={"Update Your NFTs"} onClick={() => onFilterPressed(activeFilter)}><MdUpdate size={30} /></div>
                            :
                            <div className="spacetop1 spaceleft1" title={"Updating Marketplace"} ><Puff color="#B75CFF" height={25} width={25} /></div>
                        }
                    </div>
                    <p className="spacebottom3 halfwhite size2 ta-center">
                        Track your collection, sales, purchases,<br />and your earnings.
                    </p>
                    <div className='row jc-center'>
                        <div className="col10 col12-md table-card bg-white10 spacebottom4">
                            <div className='row jc-right' style={{ textAlign: "right" }}>
                                {!earningsLoading ?
                                    <div className="col12" style={{ cursor: "pointer" }} title={"Update Your Earnings"} onClick={() => onEarningsUpdatePressed()}><MdUpdate size={20} /></div>
                                    :
                                    <div className="col12" title={"Updating Your Earnings"}><Puff color="#B75CFF" height={25} width={25} /></div>
                                }
                            </div>
                            <EarningsTable earnings={userWallet.earnings} refreshFunction={onEarningsUpdatePressed} />
                        </div>
                    </div>

                    <div className="row spacebottom3 filter-buttons jc-center">
                        <div className="col3 filter col6-xs spacebottom1-xs your-nft-filter-button collected active" onClick={() => onFilterPressed("collected")}>Collected</div>
                        <div className="col3 filter col6-xs spacebottom1-xs your-nft-filter-button onSale" onClick={() => onFilterPressed("onSale")}>On Sale</div>
                        <div className="col3 filter col6-xs spacebottom1-xs your-nft-filter-button purchased" onClick={() => onFilterPressed("purchased")}>Purchased</div>
                        <div className="col3 filter col6-xs spacebottom1-xs your-nft-filter-button sold" onClick={() => onFilterPressed("sold")}>Sold</div>
                    </div>

                    {userNFTsLoading &&
                        <div className='row jc-center spacebottom2'>
                            <Puff color="#B75CFF" height={60} width={60} />
                        </div>
                    }

                    <div className="row box-card jc-evenly-md">
                        {activeItems && activeItems.length > 0 && activeFilter == "collected" ?

                            <CollectedNFTs activeItems={activeItems} refreshFunction={initialiseUserData} />
                            :
                            activeItems && activeItems.length > 0 && activeFilter == "onSale" ?

                                <NFTsOnSale activeItems={activeItems} refreshFunction={initialiseUserData} />

                                : activeItems && activeItems.length > 0 && activeFilter == "purchased" ?

                                    <NFTsPurchased activeItems={activeItems} />

                                    : activeItems && activeItems.length > 0 && activeFilter == "sold" &&
                                    <NFTsSold activeItems={activeItems} />
                        }

                        <Pagination allItemsArray={currentItemsArray} filteredArray={activeItems} perPage={4} updateArrayState={setActiveItems} />
                    </div>

                    <div className="row box-card jc-evenly-md">
                        <div className="col12 flex spacetop2 spacebottom2 jc-between">
                            <h3 className="size3 bold">Your Activity</h3>
                            {!tradesLoading ?
                                <div className="text-link" style={{ cursor: "pointer" }} title={"Update Your Activity"} onClick={() => onTradesUpdatePressed()}><MdUpdate size={30} /></div>
                                :
                                <div> <Puff color="#B75CFF" height={35} width={35} /></div>
                            }
                        </div>
                        <ActivityTable data={currentTrades} />
                        <Pagination allItemsArray={trades} filteredArray={currentTrades} perPage={5} updateArrayState={setCurrentTrades} />
                    </div>
                </div>
            </section>
        </>
    )
}
