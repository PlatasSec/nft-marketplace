import React, { useEffect, useState } from 'react'

import { ThreeDots } from 'react-loader-spinner'
import { mintNFT } from '../../utils/interact';
import { generateNewIMG, getNewParagraph, generateNewTitle, shortDescription, showTransactionPopUp } from '../../utils/auxiliary';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { getAllNFTsFromSubgraph } from '../../utils/subgraph';

function Mint() {

    const [url, setURL] = useState("");
    const [imageID, setImageID] = useState("");
    const [firstImgRequested, setFirstImgRequested] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [generateNewNFTLoading, setGenerateNewNFTLoading] = useState(false);
    const [mintNewNFTLoading, setMintNewNFTLoading] = useState(false);

    useEffect(() => {
        (async () => {
            if (firstImgRequested) return
            await generateNewRandomNFT()
            setFirstImgRequested(true)
        })()
    }, [])

    const generateNewRandomNFT = async () => {

        if (generateNewNFTLoading) return

        setGenerateNewNFTLoading(true)

        // Get random metadata
        setTitle(generateNewTitle())
        setDescription(getNewParagraph())
        await getNewNFTImage()

        setGenerateNewNFTLoading(false)
    }

    const getNewNFTImage = async () => {

        const newNFTImageResponse = await generateNewIMG()
        setURL(newNFTImageResponse.data.src)
        setImageID(newNFTImageResponse.data.id)
        setFirstImgRequested(true)
        return { id: newNFTImageResponse.data.id, src: newNFTImageResponse.data.src }
    }



    const onMintPressed = async () => {

        if (mintNewNFTLoading || url.trim() === "" || title.trim() === "" || description.trim() === "") return

        setMintNewNFTLoading(true)

        var mintToast = toast.loading("Minting new NFT")

        const { success, result, hash } = await mintNFT(url, title, description)

        if (success) {
            toast.success("Congratulations! Your NFT has successfully been minted.", { id: mintToast })
            showTransactionPopUp(hash)
            await generateNewRandomNFT()
        } else {
            toast.error(result, { id: mintToast })
        }
        setMintNewNFTLoading(false)
    };


    return (
        <section id="mint" className="spacer10">
            <div className="container">
                <h1 className="bold size4 ta-center">Mint you NFT</h1>
                <p className="spacebottom3 halfwhite size2 ta-center">
                    Mint the current NFT or generate a new one<br />for free.
                </p>
                <div className="row ai-center jc-between flexcol-s">
                    <div className="col6 col12-s ta-center-s">
                        <h3 className="size3 bold">How It Works</h3>
                        <p className="size2 spacetop1 spacebottom3 halfwhite">
                            Every time you visit the home page a new random NFT metadata is generated. <Link href={"https://picsum.photos"}><a className='text-link' target={"_blank"} style={{ textDecoration: "underline" }}> Picsum Photos</a></Link> and
                            <Link href={"https://www.npmjs.com/package/lorem-ipsum"}><a className='text-link' target={"_blank"} style={{ textDecoration: "underline" }}> Lorem Picsum</a></Link> library are used to get a random picture, name and description
                            for the NFT. You can generate a new one by clicking the button below. Once you click on Mint NFT button, the app pins (stores) the NFT's metadata to
                            <Link href={"https://www.pinata.cloud/"}><a className='text-link' target={"_blank"} style={{ textDecoration: "underline" }}> Pinata IPFS</a></Link>, receives the IPFS CID, and executes the mint function on the smart contract by passing the said CID
                            to store it on the blockchain. You'll automatically receive the your random NFT on your wallet and it'll be ready to be traded on the Marketplace.
                        </p>
                        <div className="row col8 col9-md jc-between spacebottom4 jc-evenly-s col12-s">
                            {!generateNewNFTLoading ?
                                !mintNewNFTLoading ?
                                    <div className="btn bg-white10 size2 white" style={{ display: "flex", flexDirection: "row" }} onClick={generateNewRandomNFT}>
                                        <p>Generate New</p>
                                    </div>
                                    :
                                    <div className="btn bg-white10 size2 white" style={{ display: "flex", flexDirection: "row" }}>
                                        <p style={{ paddingRight: 10 }}>Minting NFT</p>
                                        <div style={{ paddingTop: 4 }}>
                                            <ThreeDots color="#B75CFF" height={30} width={30} />
                                        </div>
                                    </div>
                                :
                                <div className="btn bg-white10 size2 white" style={{ display: "flex", flexDirection: "row" }}>
                                    <p style={{ paddingRight: 10 }}>Generating New</p>
                                    <div style={{ paddingTop: 4 }}>
                                        <ThreeDots color="#B75CFF" height={30} width={30} />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>

                    <div className="col4 card collect bg-white10 col5-md col8-s">
                        <Image id={imageID} src={`${url.length > 0 ? url : "/assets/img/about.png"}`} width={428} height={524} />
                        <div className="row jc-between spacetop2">
                            <div>
                                <p className="size2 halfwhite">Name</p>
                                <h5 className="size2 bold">{title.length > 0 ? title : "DefaultRandomTitle"}</h5>
                            </div>
                            <div>
                                <p className="current halfwhite">Price</p>
                                <h5 className="size2 bold">Free</h5>
                            </div>

                        </div>
                        <div className="row jc-between spacetop1">
                            <div>
                                <p className="size2 halfwhite">Description</p>
                                <h5 className="size1-5">{description.length > 0 ? shortDescription(description) : "DefaultRandomDescritpion"}</h5>
                            </div>
                        </div>
                        {!mintNewNFTLoading ?
                            !generateNewNFTLoading ?
                                <a className="bid size2 ta-center" onClick={onMintPressed} style={{ cursor: "pointer" }}>Mint NFT</a>
                                :
                                <div className="bid-white size2 white ta-center" >
                                    <p style={{ paddingRight: 10 }}>Generating New</p>
                                    <div style={{ paddingTop: 4 }}>
                                        <ThreeDots color="#B75CFF" height={30} width={30} />
                                    </div>
                                </div>
                            :
                            <div className="bid-white size2 white ta-center" style={{ display: "flex", flexDirection: "row" }}>
                                <p style={{ paddingRight: 10 }}>Minting NFT</p>
                                <div style={{ paddingTop: 4 }}>
                                    <ThreeDots color="#ffffff" height={30} width={30} />
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Mint