import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import axios from 'axios'

import { subgraphId, nft_contract_address } from '../constants/global'

const SUBGRAPH_API_URL = `https://api.thegraph.com/subgraphs/id/${subgraphId}`

/* QUERIES */

// NFTs
const allNFTs = `
  query {
    tokens (orderBy: createdAt, orderDirection: asc){
        id
        tokenId
        collection {id}
        owner {id}
        name
        description
        image
        metadata   
        createdAt     
      }
  }
`
// Collection
const collectionInfo = `
  query($nftContract: String) {
    collections(where: {id: $nftContract}) {
        id
        name
        symbol
        maxTokens
        creator {
          id
        }
        isAllowed
        tokens {
          id
          tokenId
          collection {id}
          name
          description
          image
          owner {id}
        }
        createdAt
        updatedAt
        removedAt
      }
  }
`

// Holder
const holderInfo = `
  query($holder: String){
    users (where: {id: $holder}){
        deposited
        pendingToWithdraw
        withdrawn
      }
  }
`

const holderTokens = `
query($holder: String){
    users (where: {id: $holder}){
        id
        tokens (where: {owner: $holder}, orderBy: createdAt, orderDirection: desc){
          id
          tokenId
          collection {id}
          name
          image
          owner{id}
          description
          createdAt
        }
      }
  }
`

const holderTokensOnSale = `
    query($holder: String){
        users (where: {id: $holder}){
            id
            items (where: {soldAt: 0, removedAt: 0}, orderBy: createdAt, orderDirection: desc){
                id
                token{tokenId name description image collection {id}}
                price
                seller{id}
                buyer{id}
                createdAt
                updatedAt
                soldAt
                removedAt
            }
        }
    }
`

const holderTokensPurchased = `
    query($holder: String){
        items (where: {buyer: $holder}, orderBy: soldAt, orderDirection: desc){
            id
            token { id name image }
            price
            seller {id }
            buyer {id}
            createdAt
            updatedAt
            soldAt
        }
    }
`

const holderNFTsSold = `
    query ($holder: String){
        users (where: {id: $holder}){
            id
            items (where: {soldAt_gt: 0}, orderBy: soldAt, orderDirection: desc){
              id
              buyer {id}
              price
              token {
                id
                tokenId
                name
                image
                description
              }
              createdAt
              updatedAt
              soldAt
            }
          }
    }
`

const holderTrades = `
    query($holder: String){
        trades (where: {from: $holder}, orderBy: createdAt, orderDirection: desc){
            id
            type
            price
            from {id}
            to {id}
            item {
              id
              token {tokenId name}
              price
              createdAt
              soldAt
            }
            hash
            createdAt
          }
    }
`

const allHolderTrades = `
    query($holder: String){
        from: trades (where: {from:$holder}){
            id
            type
            price
            from {id}
            to {id}
            item {
              id
              token {tokenId name }
              price
              createdAt
              soldAt
            }
            hash
            createdAt
          }
          to: trades (where: {to:$holder}){
            id
            type
            price
            from {id}
            to {id}
            item {
              id
              token {tokenId name }
              price
              createdAt
              soldAt
            }
            hash
            createdAt
          }
    }
`

// Marketplace
const allMarketplaceItems = `
    query{
        items {
            id
            token{tokenId collection {id} name image description owner{id}}
            seller {id}
            buyer {id}
            price
            createdAt
            updatedAt
            soldAt
        }
    }
`

const marketplaceItemsOnSale = `
    query{
        items(where: {soldAt: 0, removedAt: 0}, orderBy: createdAt, orderDirection: desc) {
            id
            token{tokenId collection {id} name image description owner{id}}
            seller {id}
            buyer {id}
            price
            createdAt
            updatedAt
            soldAt
            removedAt
        }
    }
`

const marketplaceItemsSold = `
    query {
        items(where: {soldAt_gt: 0}, orderBy: soldAt, orderDirection: desc) {
            id
            token{tokenId collection {id} name image description owner{id}}
            seller {id}
            buyer {id}
            price
            createdAt
            updatedAt
            soldAt
          }
    }
`

const allTrades = `
    query{
        trades (orderBy:createdAt, orderDirection:desc){
            id
            type
            price
            from {id}
            to {id}
            item {
              id
              token {tokenId name}
              price
              createdAt
              soldAt
            }
            hash
            createdAt
          }
    }
`

// Others
const subgraphHealth = `
{
    indexingStatuses(subgraphs: ["${subgraphId}"]) {
      subgraph
      synced
      health
      entityCount
      fatalError {
        handler
        message
        deterministic
        block {
          hash
          number
        }
      }
      chains {
        chainHeadBlock {
          number
        }
        earliestBlock {
          number
        }
        latestBlock {
          number
        }
      }
    }
  }
`

/* FUNCTIONS */

// NFTs
export async function getAllNFTsFromSubgraph() {
    const client = new ApolloClient({
        uri: SUBGRAPH_API_URL,
        cache: new InMemoryCache()
    })

    try {
        let result = await client.query({ query: gql(allNFTs) });
        return {
            success: true,
            result: result.data.tokens
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            result: error
        };
    }

}

// Collection
export async function getCollectionInfoFromSubgraph() {
    const client = new ApolloClient({
        uri: SUBGRAPH_API_URL,
        cache: new InMemoryCache()
    })

    try {
        const nftContract = nft_contract_address.toLowerCase()
        let result = await client.query({ query: gql(collectionInfo), variables: { nftContract } });
        console.log(result.data.collections)
        return {
            success: true,
            result: result.data.collections
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            result: error
        };
    }

}

// MARKETPLACE
export async function getAllMarketplaceItems() {
    const client = new ApolloClient({
        uri: SUBGRAPH_API_URL,
        cache: new InMemoryCache()
    })

    try {
        let result = await client.query({ query: gql(allMarketplaceItems) });
        return {
            success: true,
            result: result.data.items
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            result: error
        };
    }

}

export async function getMarketplaceItemsOnSaleFromSubgraph() {
    const client = new ApolloClient({
        uri: SUBGRAPH_API_URL,
        cache: new InMemoryCache()
    })

    try {
        let result = await client.query({ query: gql(marketplaceItemsOnSale) });
        return {
            success: true,
            result: result.data.items
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            result: error
        };
    }

}

export async function getMarketplaceItemsSoldFromSubgraph() {
    const client = new ApolloClient({
        uri: SUBGRAPH_API_URL,
        cache: new InMemoryCache()
    })

    try {
        let result = await client.query({ query: gql(marketplaceItemsSold) });
        return {
            success: true,
            result: result.data.items
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            result: error
        };
    }

}

export async function getAllTradesFromSubgraphFromSubgraph() {
    const client = new ApolloClient({
        uri: SUBGRAPH_API_URL,
        cache: new InMemoryCache()
    })

    try {
        let result = await client.query({ query: gql(allTrades) });
        return {
            success: true,
            result: result.data.trades
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            result: error
        };
    }

}

export async function getAllMarketplaceTradesFromSubgraph() {
    const client = new ApolloClient({
        uri: SUBGRAPH_API_URL,
        cache: new InMemoryCache()
    })

    try {
        let result = await client.query({ query: gql(allTrades) });
        return {
            success: true,
            result: result.data.trades
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            result: error
        };
    }

}



// HOLDERS

export async function getHolderInfoFromSubgraph(holder) {
    const client = new ApolloClient({
        uri: SUBGRAPH_API_URL,
        cache: new InMemoryCache()
    })

    try {
        let result = await client.query({ query: gql(holderInfo), variables: { holder }, });
        return {
            success: true,
            result: result.data.users.length > 0 ? result.data.users[0] : []
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            result: error
        };
    }

}


export async function getHolderTokensFromSubgraph(holder) {
    const client = new ApolloClient({
        uri: SUBGRAPH_API_URL,
        cache: new InMemoryCache()
    })

    try {
        let result = await client.query({ query: gql(holderTokens), variables: { holder } });
        return {
            success: true,
            result: result.data.users.length > 0 ? result.data.users[0].tokens : []
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            result: error
        };
    }

}

export async function getHolderNFTsOnSaleFromSubgraph(holder) {
    const client = new ApolloClient({
        uri: SUBGRAPH_API_URL,
        cache: new InMemoryCache()
    })

    try {
        let result = await client.query({ query: gql(holderTokensOnSale), variables: { holder } });
        return {
            success: true,
            result: result.data.users.length > 0 ? result.data.users[0].items : []
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            result: error
        };
    }

}

export async function getHolderNFTsPurchasedFromSubgraph(holder) {
    const client = new ApolloClient({
        uri: SUBGRAPH_API_URL,
        cache: new InMemoryCache()
    })

    try {
        let result = await client.query({ query: gql(holderTokensPurchased), variables: { holder } });
        return {
            success: true,
            result: result.data.items
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            result: error
        };
    }

}

export async function getHolderNFTsSoldFromSubgraph(holder) {
    const client = new ApolloClient({
        uri: SUBGRAPH_API_URL,
        cache: new InMemoryCache()
    })

    try {
        let result = await client.query({ query: gql(holderNFTsSold), variables: { holder } });
        return {
            success: true,
            result: result.data.users.length > 0 ? result.data.users[0].items : []
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            result: error
        };
    }

}

export async function getHolderTradesFromSubgraph(holder) {
    const client = new ApolloClient({
        uri: SUBGRAPH_API_URL,
        cache: new InMemoryCache()
    })

    try {
        let result = await client.query({ query: gql(holderTrades), variables: { holder } });
        return {
            success: true,
            result: result.data.trades
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            result: error
        };
    }

}

export async function getAllHolderTradesFromSubgraph(holder) {

    const client = new ApolloClient({
        uri: SUBGRAPH_API_URL,
        cache: new InMemoryCache()
    })

    try {
        let result = await client.query({ query: gql(allHolderTrades), variables: { holder } });
        return {
            success: true,
            result: result.data
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            result: error
        };
    }

}

export async function getSubgraphHealthFromSubgraph() {

    try {
        const result = await axios.post("https://api.thegraph.com/index-node/graphql",
            { query: subgraphHealth }, { headers: { "content-type": "application/json" } });
        if (result.status == 200) {
            return { success: true, result: result.data.data.indexingStatuses[0] }
        } else {
            return { success: false, result: [] }
        }
    } catch (err) {
        // console.log(err)
    }

}






