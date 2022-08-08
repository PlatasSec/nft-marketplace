import React, { useState, useEffect } from 'react'
import { getSubgraphHealthFromSubgraph } from '../../utils/subgraph'
import { BsCheck2Circle } from "react-icons/bs"
import { AiOutlineCloudDownload } from "react-icons/ai"
import { ImCross } from "react-icons/im"
import Link from 'next/link'
import { SiStatuspal } from "react-icons/si"

function SubgraphModal() {

    const [subgraphHealth, setSubgraphHealth] = useState(false)
    const [loadingSubgraphHealth, setLoadingSubgraphHealth] = useState(false)
    const [modalState, setModalState] = useState("open")

    const [modalLocalStorageInitialised, setModalLocalStorageInitialised] = useState(false)

    useEffect(() => {
        if (modalLocalStorageInitialised || typeof window == undefined) return
        // Change state variable to localStorage if any
        // to keep the user's preference (shown or hidden)
        const previousSubgraphLocalStorageValue = localStorage.getItem("subgraphModalState")
        if (previousSubgraphLocalStorageValue != null) setModalState(previousSubgraphLocalStorageValue)

        setModalLocalStorageInitialised(true)
    })


    function updateModalState(_state) {

        if (_state != "open" && _state != "closed") return

        localStorage.setItem("subgraphModalState", _state)
        setModalState(_state)

    }

    // Fetch subgraph health
    useEffect(() => {
        (async () => {

            let timeout;

            const checkApi = async () => {

                if (modalState == "closed" || loadingSubgraphHealth) return

                setLoadingSubgraphHealth(true)
                const getSubgraphHealthRequest = await getSubgraphHealthFromSubgraph();
                if (getSubgraphHealthRequest && getSubgraphHealthRequest.success) {
                    setSubgraphHealth(getSubgraphHealthRequest.result)
                }
                setLoadingSubgraphHealth(false)
                timeout = setTimeout(checkApi, 3000);
            }

            timeout = setTimeout(checkApi, 1000);

            return () => {
                clearTimeout(timeout);
            }

        })()
    }, [])


    return subgraphHealth && (
        <>
            {modalState == "open" ?
                <div id="subgraph-modal" className='my-modal' >
                    <div className="my-modal_content">
                        <div className='row jc-left'>
                            <h1 className='spacebottom1'>Subgraph Status</h1>
                        </div>

                        {!subgraphHealth.fatalError && subgraphHealth.synced ?
                            <>
                                <div className='row'>
                                    {subgraphHealth.chains[0].chainHeadBlock.number == subgraphHealth.chains[0].latestBlock.number ?
                                        <>
                                            <div style={{ paddingTop: 5 }}><BsCheck2Circle color="#ADDB67" size={16} /></div>
                                            <p className='size1-5 spaceleft1'>Synced</p>
                                        </>
                                        :
                                        <>
                                            <div className='row jc-left'>
                                                <div style={{ paddingTop: 5 }}><AiOutlineCloudDownload color="#B75CFF" size={16} /></div>
                                                <p className='size1-5 spaceleft1'>Syncing,</p>
                                                <p className='size1' style={{ paddingTop: 8, paddingLeft: 4 }}>{subgraphHealth.chains[0].chainHeadBlock.number - subgraphHealth.chains[0].latestBlock.number} blocks pending...</p>
                                            </div>

                                        </>
                                    }
                                </div>
                                <div className='column'>
                                    <div>
                                        <p className='size1-3'>Last Chain Block: {subgraphHealth.chains[0].chainHeadBlock.number}</p>
                                    </div>
                                    <div>
                                        <p className='size1-3'>Last Synced Block: {subgraphHealth.chains[0].latestBlock.number}</p>
                                    </div>
                                </div>

                            </>
                            :
                            <p className='size2'>
                                Subgraph's health can't be obtain at this moment.
                            </p>
                        }
                        <div className="my-modal_footer spacetop1">
                            <Link href={`https://api.thegraph.com/subgraphs/id/${subgraphHealth.subgraph}`}>
                                <a target={"_blank"} className='size1 text-link'>Access subgraph </a>
                            </Link>

                        </div>

                        <a className="my-modal_close text-link" onClick={() => updateModalState("closed")}><ImCross /></a>
                    </div>
                </div>
                :
                modalState == "closed" &&
                <div id="subgraph-modal-handler" className='my-modal-open'>
                    <div className="my-modal-open_content"
                        title={!subgraphHealth.fatalError && subgraphHealth.synced && subgraphHealth.chains[0].chainHeadBlock.number != subgraphHealth.chains[0].latestBlock.number ? "Syncing subgraph" : "Subgraph Synced"}>
                        <a className="my-modal_close text-link"
                            onClick={() => updateModalState("open")}>
                            <SiStatuspal size={35}
                                color={!subgraphHealth.fatalError && subgraphHealth.synced && subgraphHealth.chains[0].chainHeadBlock.number != subgraphHealth.chains[0].latestBlock.number ? "#B75CFF" : "#fff"} />
                        </a>
                    </div>
                </div>

            }
        </>
    )
}

export default SubgraphModal