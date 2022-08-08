import React from 'react'
import Link from "next/link"
import Image from "next/image"
import { MdNewLabel, MdShoppingCart, MdOutlineChangeCircle, MdRemoveShoppingCart } from "react-icons/md"
import { BiLinkExternal } from "react-icons/bi";
import { ethers } from "ethers";
import { shortAddress, convertToFullDateTime } from '../../utils/auxiliary'
import useAppContext from '../Context'
import { _network, marketplace_contract_address } from '../../constants/global'
import { getAddressExplorer, getTransactionExplorer } from '../../utils/auxiliary'


function ActivityTable({ data }) {

    const { userWallet } = useAppContext()

    return (
        <div className="col12 table-card bg-white10">
            <table>
                <tbody className="jc-center">
                    <tr>
                        <th className="size2 size1-md">Event</th>
                        <th className="size2 size1-md">Price</th>
                        <th className="size2 size1-md">Token</th>
                        <th className="size2 size1-md">From</th>
                        <th className="size2 size1-md">To</th>
                        <th className="size2 size1-md">Date</th>
                        <th className="size2 size1-md">Tx</th>
                    </tr>
                    {data && data.length > 0 ? data.map((trade, idx) =>
                    (
                        <tr key={idx} className="jc-center">
                            <td className="row size2 size1-md halfwhite jc-center spacetop1">
                                <div style={{ paddingTop: 2, marginRight: 4 }}>
                                    {trade.type == "List" ? <MdNewLabel style={{ paddingTop: 1 }} /> :
                                        trade.type == "Update" ? <MdOutlineChangeCircle /> :
                                            trade.type == "Sale" ? <MdShoppingCart /> : trade.type == "Remove" ? <MdRemoveShoppingCart /> : ""}
                                </div>
                                <div>
                                    {trade.type}
                                </div>
                            </td>
                            <td className="size2 size1-md halfwhite">{trade.price && <><Image src={_network.logo} width={18} height={18} /> {ethers.utils.formatEther(trade.price.toString())}</>}</td>
                            <td className="size2 size1-md halfwhite">#{trade.item.token.tokenId} {trade.item.token.name}</td>
                            <td className="size2 size1-md halfwhite text-link">
                                <Link href={getAddressExplorer(trade.from.id)}>
                                    <a target={"_blank"}>{userWallet && userWallet.address == trade.from.id ? "Your Wallet" : shortAddress(trade.from.id)}</a>
                                </Link>
                            </td>
                            <td className="size2 size1-md halfwhite text-link">
                                <Link href={getAddressExplorer(trade.to.id)}>
                                    <a target={"_blank"}>
                                        {trade.to.id == marketplace_contract_address.toLowerCase() ? "Marketplace" : userWallet && userWallet.address == trade.to.id ? "Your Wallet" : shortAddress(trade.to.id)}
                                    </a>
                                </Link>
                            </td>
                            <td className="size2 size1-md halfwhite">{convertToFullDateTime(trade.createdAt)}</td>
                            <td className="size2 size1-md halfwhite text-link"><Link href={getTransactionExplorer(trade.hash)}><a target={"_blank"}>{shortAddress(trade.hash)} <BiLinkExternal /></a></Link></td>
                        </tr>
                    ))
                        :
                        <tr className="jc-center">
                            <td className="size2 halfwhite">-</td>
                            <td className="size2 halfwhite">-</td>
                            <td className="size2 halfwhite">-</td>
                            <td className="size2 halfwhite">-</td>
                            <td className="size2 halfwhite">-</td>
                            <td className="size2 halfwhite">-</td>
                            <td className="size2 halfwhite">-</td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>
    )
}

export default ActivityTable