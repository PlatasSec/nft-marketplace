import React from 'react'
import Link from 'next/link'
import { _network } from '../../constants/global'
import { BsGithub } from "react-icons/bs";

function About() {
    return (
        <section id="about" className="spacer10">
            <div className="container">
                <h1 className="bold size4 ta-center">About The Project</h1>
                <p className="spacebottom4 halfwhite size2 ta-center">
                    I've built (for development purposes) a full-stack NFT Marketplace project. The most popular <br /> web3 technologies
                    have been used such as Smart Contracts (Solidity), Ethers.js, <br /> subgraph from The Graph Protocol, IPFS, Next.js and Vercel, among others.
                </p>
                <div className="row ai-center jc-between flexcol-s">
                    <div className="col5 col10-s spacebottom2-s">
                        <img src="/assets/img/about.png" className="img-responsive" />
                    </div>
                    <div className="col6 col12-s ta-center-s">
                        <h3 className="size3 bold">Non-Fungible Tokens (NFTs)</h3>
                        <p className="size2 spacetop1 spacebottom3 halfwhite">
                            NFTs are tokens that we can use to represent ownership of unique items.
                            They let us tokenise things like art, collectibles, even real estate.
                            They can only have one official owner at a time and they're secured by
                            the Ethereum blockchain – no one can modify the record of ownership or copy/paste a new NFT into existence <Link href={"https://ethereum.org/en/nft/"}><a className='text-link' target={"_blank"} style={{ textDecoration: "underline" }}>(Ethereum.org, 2022)</a></Link>.
                        </p>
                        <p className="size2 spacetop1 spacebottom3 halfwhite">
                            This project provides a simple application to mint random NFTs on {_network.chainName} where users can also buy and sell these tokens on a propietary marketplace. It's open-source - if you're a dev make sure to check it out on
                            my <Link href={"https://github.com/platasCrypto?tab=repositories"}><a className='text-link' target={"_blank"} style={{ textDecoration: "underline" }}>Github</a></Link> repository!
                        </p>
                        <Link href={"https://github.com/platasCrypto"}>
                            <a className="btn bg-purple size2 white" target={"_blank"} title={"Github Repository"}><BsGithub size={16} className="spaceright1" />Github</a>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default About