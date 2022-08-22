import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import About from '../components/about/About'
import Collections from '../components/collections/Collections'
import Intro from '../components/intro/Intro'
import Mint from '../components/mint/Mint'
import { getCollectionInfoFromSubgraph, getMarketplaceItemsOnSaleFromSubgraph, getMarketplaceItemsSoldFromSubgraph } from '../utils/subgraph'
import { _network } from '../constants/global'

export default function Home(props) {
  return (
    <>
      <Head>
        <title>PC Marketplace - Home</title>
      </Head>
      <Intro stats={props.stats} />
      <section className="spacer5 spacer0-xs">
        <div className="container row jc-between jc-center-md">
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
      <Mint collection={props.collection} />
      <Collections collection={props.collection} />
    </>
  )
}

export async function getServerSideProps(context) {

  const getCollectionRequest = await getCollectionInfoFromSubgraph();
  const getCollectionResult = getCollectionRequest.success ?
    getCollectionRequest.result[0] : null

  const getAllNFTsOnSale = await getMarketplaceItemsOnSaleFromSubgraph()
  const getAllNFTsOnSaleResult = getAllNFTsOnSale.success ?
    getAllNFTsOnSale.result.length : null

  const getANFTsSoldRequest = await getMarketplaceItemsSoldFromSubgraph()
  const getAllNFTsSoldResult = getANFTsSoldRequest.success ?
    getANFTsSoldRequest.result.length : null

  return {
    props: {
      collection: getCollectionResult,
      stats: {
        totalMintedNFTs: getCollectionResult.tokens.length,
        totalNFTsOnSale: getAllNFTsOnSaleResult,
        totalNFTsSold: getAllNFTsSoldResult
      }
    },
  }
}
