import React, { useEffect, useState } from 'react'
import { connectWallet, getCurrentWalletConnected } from '../../utils/interact'
import useAppContext from '../Context'
import { shortAddress } from '../../utils/auxiliary'
import Link from 'next/link'
import { FaWallet } from "react-icons/fa"
import { getHolderInfoFromSubgraph } from '../../utils/subgraph'
import Image from 'next/image'
import { FaBars } from "react-icons/fa"
import $ from 'jquery'
import { _network } from '../../constants/global'
import toast from 'react-hot-toast'

function Nav() {

    const { userWallet, setUserWallet } = useAppContext()
    const [walletInitialised, setWalletInitialised] = useState(false)

    useEffect(() => {
        (async () => {
            if (walletInitialised) return

            await connectWalletData()
            await addWalletListener()

            setWalletInitialised(true)
        })()
    }, [])

    function closeNav() {
        let navbar = document.querySelector('.menu')
        navbar.classList.remove('active')
    }

    async function addWalletListener() {
        if (window.ethereum) {
            window.ethereum.on('chainChanged', async (data) => {
                await connectWalletData()
            })
            window.ethereum.on("accountsChanged", async (accounts) => {
                await connectWalletData()
            });
        }
    }

    const connectWalletData = async () => {
        const connectWalletRequest = await connectWallet();
        if (connectWalletRequest.success) {
            const holderInfoRequest = await getHolderInfoFromSubgraph(connectWalletRequest.result.address)
            setUserWallet({ address: connectWalletRequest.result.address, isApproved: connectWalletRequest.result.isApproved, balance: connectWalletRequest.result.balance, earnings: holderInfoRequest.success ? holderInfoRequest.result : [] })
        }
    };

    return (
        <header className="header bg-white10">
            <div className="container">
                <Link href="/">
                    <a className="logo bold white">PlatasCrypto<span className="lightpurple">Market</span></a>
                </Link>

                <div className="menu">
                    {/* <form className="search-form">
                        <label htmlFor="search-box" className="fas fa-search" />
                        <input type="search" id="search-box" placeholder="Search items" />
                    </form> */}
                    <Link href="/marketplace">
                        <a className='nav-link' onClick={() => closeNav()}>Marketplace</a>
                    </Link>

                    <Link href="/profile">
                        <a className='nav-link' onClick={() => closeNav()}>Profile</a>
                    </Link>

                    {userWallet.balance &&
                        <a className="btn bg-white10 size2 white spaceright1 ta-center"><Image src={_network.logo} width={16} height={16} /> {userWallet.balance} {_network.nativeCurrency.symbol}</a>
                    }

                    {userWallet.address && userWallet.address.length > 0 ?
                        <div className="btn bg-purple wallet row">
                            <div className='spaceright1'>
                                <FaWallet />
                            </div>
                            {shortAddress(userWallet.address)}</div>
                        :
                        <div className="btn bg-purple wallet" onClick={connectWalletData}>Connect Wallet</div>
                    }
                </div>
                <div id="bar"><FaBars /></div>
            </div>
        </header>

    )
}

export default Nav