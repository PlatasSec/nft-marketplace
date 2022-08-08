import Link from 'next/link'
import React from 'react'
import { _network } from '../../constants/global'

function Footer() {
    return (
        <footer className="spacer10">
            <div className="container row jc-between flexcol-s ta-center-s">
                <div className="row flexcol spacebottom3-s">
                    <Link href={"/"}>
                        <a className="size2 bold white">PlatasCrypto<span className="lightpurple">Marketplace</span></a>
                    </Link>
                    <p className="size2 halfwhite spacetop2">An NFT Marketplace project on <br /> {_network.chainName}. Mint, <br /> buy and sell random NFTs.</p>
                </div>
                <div className="row flexcol spacebottom3-s">
                    <a className="bold size2 white">Pages</a>
                    <Link href={"/"}>
                        <a className="size2 halfwhite spacetop2" title={"Home Page"}>Home</a>
                    </Link>
                    <Link href={"/marketplace"}>
                        <a className="size2 halfwhite spacetop2" title={"Marketplace Page"}>Marketplace</a>
                    </Link>
                    <Link href={"/profile"}>
                        <a className="size2 halfwhite spacetop2" title={"Profile Page"}>Profile</a>
                    </Link>
                </div>
                <div className="row flexcol spacebottom3-s">
                    <h5 className="bold size2">Socials</h5>
                    <Link href={"https://www.linkedin.com/in/jorgeplatasfeced"}>
                        <a className="size2 halfwhite spacetop2" target={"_blank"} title={"Linkedin: @jorgeplatasfeced"}>LinkedIn</a>
                    </Link>
                    <Link href={"https://twitter.com/platas_crypto"}>
                        <a className="size2 halfwhite spacetop2" target={"_blank"} title={"Twitter: @platas_crypto"}>Twitter</a>
                    </Link>
                    <Link href={"https://github.com/platasCrypto"}>
                        <a className="size2 halfwhite spacetop2" target={"_blank"} title={"Github: @platasCrypto"}>GitHub</a>
                    </Link>
                </div>
            </div>
            <p className="size2 halfwhite spacetop5 ta-center">Copyright © {new Date().getFullYear()} All Rights Reserved |
                Developed by
                <Link href={"https://www.linkedin.com/in/jorgeplatasfeced"}>
                    <a target={"_blank"} title={"Linkedin: @jorgeplatasfeced"}><span className="white bold"> PlatasCrypto</span></a>
                </Link>

            </p>
        </footer>
    )
}

export default Footer