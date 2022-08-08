import { getMarketplaceItemsOnSaleFromSubgraph, getMarketplaceItemsSoldFromSubgraph, getAllMarketplaceTradesFromSubgraph } from "../../utils/subgraph"
import { useEffect, useState } from "react"
import useAppContext from "../../components/Context"
import $ from 'jquery'
import Pagination from "../../components/pagination/Pagination"
import { Puff } from 'react-loader-spinner'
import ActivityTable from "../../components/tables/ActivityTable"
import Head from "next/head";
import NFTsOnSale from "../../components/marketplace/NFTsOnSale"
import NFTsSold from "../../components/marketplace/NFTsSold"
import { MdUpdate } from "react-icons/md"

export default function Marketplace({ itemsOnSell, allTrades }) {

    const { userWallet } = useAppContext()

    const [activeItems, setActiveItems] = useState(itemsOnSell)
    const [activeFilter, setActiveFilter] = useState("onSale")
    const [currentItemsArray, setCurrentItemsArray] = useState(false)
    const [itemsLoading, setItemsLoading] = useState(false)
    const [tradesLoading, setTradesLoading] = useState(false)

    const [trades, setTrades] = useState(allTrades)

    const [currentTrades, setCurrentTrades] = useState();

    useEffect(() => {
        $('.marketplace-filter-button').removeClass('active')
        $(`.marketplace-filter-button+.${activeFilter}`).addClass('active')
    }, [activeItems])

    const initialiseMarketplaceData = async (type) => {

        await onFilterPressed(type)
        await onTradesUpdatePressed()

    }

    const onFilterPressed = async (type) => {

        setItemsLoading(true)

        if (type == "onSale") {
            const itemsOnSaleRequest = await getMarketplaceItemsOnSaleFromSubgraph()
            if (itemsOnSaleRequest.success) {
                setActiveItems(itemsOnSaleRequest.result)
                setCurrentItemsArray(itemsOnSaleRequest.result)
            } else {
                setActiveItems(false)
            }

        } else if (type == "sold") {

            const itemsSoldRequest = await getMarketplaceItemsSoldFromSubgraph()
            if (itemsSoldRequest.success) {
                setActiveItems(itemsSoldRequest.result)
                setCurrentItemsArray(itemsSoldRequest.result)
            } else {
                setActiveItems(false)
            }
        } else {
            return
        }
        setItemsLoading(false)
        setActiveFilter(type)
    }

    const onTradesUpdatePressed = async () => {

        setTradesLoading(true)

        const allTradesRequest = await getAllMarketplaceTradesFromSubgraph()
        allTradesRequest.success ? setTrades(allTradesRequest.result) : false

        setTradesLoading(false)
    }



    return (
        <>
            <Head>
                <title>PC Maketplace - Market</title>
            </Head>
            <section className="collections spacer10" id="marketplace">
                <div className="container">
                    <div className="row jc-center">
                        <h1 className="bold size4 ta-center">
                            Marketplace
                        </h1>
                        {!itemsLoading ?
                            <div className="text-link spacetop1 spaceleft1" style={{ cursor: "pointer" }} title={"Update Marketplace"} onClick={() => onFilterPressed(activeFilter)}><MdUpdate size={30} /></div>
                            :
                            <div className="spacetop1 spaceleft1" title={"Updating Marketplace"} ><Puff color="#B75CFF" height={25} width={25} /></div>
                        }
                    </div>

                    <p className="spacebottom3 halfwhite size2 ta-center">
                        Lorem ipsum dolor sit amet, consectetur<br />adipiscing elit.
                    </p>
                    <div className="row spacebottom3 filter-buttons spacebottom1-xs">
                        <div id="fucking" className="col6 marketplace-filter-button onSale filter col6-xs active" onClick={() => onFilterPressed("onSale")}>On Sale</div>
                        <div className="col6 marketplace-filter-button sold filter col6-xs" onClick={() => onFilterPressed("sold")}>Sold</div>
                    </div>
                    {itemsLoading &&
                        <div className='row jc-center spacebottom2'>
                            <Puff color="#B75CFF" height={60} width={60} />
                        </div>
                    }
                    
                    <div className="row box-card jc-evenly-md">
                        {(activeItems && activeFilter) &&
                            activeFilter == "onSale" ?
                            <NFTsOnSale activeItems={activeItems} refreshFunction={initialiseMarketplaceData} />
                            :
                            activeFilter == "sold" &&
                            <NFTsSold activeItems={activeItems} />
                        }
                    </div>

                    <Pagination allItemsArray={currentItemsArray} filteredArray={activeItems} perPage={4} updateArrayState={setActiveItems} />

                    <div className="row box-card jc-evenly-md">
                        <div className="col12 flex spacetop2 spacebottom2 jc-between">
                            <h3 className="size3 bold">Marketplace Activity</h3>
                            {!tradesLoading ?
                                <div className="text-link" style={{ cursor: "pointer" }} title={"Update Activity"} onClick={() => onTradesUpdatePressed()}><MdUpdate size={30} /></div>
                                :
                                <div> <Puff color="#B75CFF" height={35} width={35} /></div>
                            }
                        </div>
                        <ActivityTable data={currentTrades} />
                        <Pagination allItemsArray={trades} filteredArray={currentTrades} perPage={4} updateArrayState={setCurrentTrades} />
                    </div>

                </div>
            </section>
        </>
    )
}

export async function getServerSideProps(context) {

    const getAllNFTsRequest = await getMarketplaceItemsOnSaleFromSubgraph()
    const getAllNFTsResult = getAllNFTsRequest.success ?
        getAllNFTsRequest.result : null

    const allTradesRequest = await getAllMarketplaceTradesFromSubgraph()
    const allTradesResult = allTradesRequest.success ?
        allTradesRequest.result : null

    return {
        props: {
            itemsOnSell: getAllNFTsResult,
            allTrades: allTradesResult
        },
    }
}
