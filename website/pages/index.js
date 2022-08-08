import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import About from '../components/about/About'
import Collections from '../components/collections/Collections'
import Intro from '../components/intro/Intro'
import Mint from '../components/mint/Mint'
import { getAllNFTsFromSubgraph, getMarketplaceItemsOnSaleFromSubgraph, getMarketplaceItemsSoldFromSubgraph } from '../utils/subgraph'
import { _network } from '../constants/global'

export default function Home({ allNFTs, stats }) {
  return (
    <>
      <Head>
        <title>PC Marketplace - Home</title>
      </Head>
      <Intro stats={stats} />
      <section className="spacer5 spacer0-xs">
        <div className="container row jc-between jc-around-md">
          <div className='col2 col4-md'>
            <Link href={_network.website}>
              <a target={"_blank"} title={"Ethereum.org Website"}><Image src={_network.homePageLogo} width={700} height={400} /></a>
            </Link>
          </div>
          <div className='col2 col4-md spacetop1'>
            <Link href={"https://www.openzeppelin.com"}>
              <a target={"_blank"} title={"OpenZeppelin Website"}><Image src="/assets/img/openzeppelin.png" width={130} height={72} /></a>
            </Link>
          </div>
          <div className='col2 col4-md spacetop1'>
            <Link href={"https://thegraph.com/"}>
              <a target={"_blank"} title={"The Graph Protocol Website"}><Image src="/assets/img/the_graph.png" width={130} height={72} /></a>
            </Link>
          </div>
          <div className='col2 col4-md spacetop1'>
            <Link href={"https://ipfs.io/"}>
              <a target={"_blank"} title={"IPFS.io Website"}><Image src="/assets/img/ipfs.png" width={130} height={72} /></a>
            </Link>
          </div>
          <div className='col2 col4-md spacetop1'>
            <Link href={"https://nextjs.org"}>
              <a target={"_blank"} title={"Next.js Website"}> <Image src="/assets/img/nextjs.png" width={130} height={72} /></a>
            </Link>
          </div>
        </div>
      </section>
      <About />
      <Mint />
      <Collections allNFTs={allNFTs} />
    </>
  )
}

export async function getServerSideProps(context) {

  const getAllNFTsRequest = await getAllNFTsFromSubgraph();
  const getAllNFTsResult = getAllNFTsRequest.success ?
    getAllNFTsRequest.result : null
  const totalMintedNFTsResult = getAllNFTsRequest.success ?
    getAllNFTsRequest.result.length : null

  const getAllNFTsOnSale = await getMarketplaceItemsOnSaleFromSubgraph()
  const getAllNFTsOnSaleResult = getAllNFTsOnSale.success ?
    getAllNFTsOnSale.result.length : null

  const getANFTsSoldRequest = await getMarketplaceItemsSoldFromSubgraph()
  const getAllNFTsSoldResult = getANFTsSoldRequest.success ?
    getANFTsSoldRequest.result.length : null

  return {
    props: {
      allNFTs: getAllNFTsResult,
      stats: {
        totalMintedNFTs: totalMintedNFTsResult,
        totalNFTsOnSale: getAllNFTsOnSaleResult,
        totalNFTsSold: getAllNFTsSoldResult
      }
    },
  }
}
