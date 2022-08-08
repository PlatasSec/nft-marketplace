# Building an NFT Marketplace on Testnet with Solidity, The Graph, IPFS and Next.js

This is a full-stack NFT Marketplace application that provides the main functions of the ERC-721 standard and a basic marketplace to trade these NFTs. It's being built for development purposes - so new features and fixes might be integrated in the future.

You can check the live web application through this link. I hope you find it useful. Enjoy it :)

## Tech Stack

For the development of this project, the following technologies have been used:

* [Solidity](https://solidity-es.readthedocs.io): source code to implement the NFT collection and Marketplace functions, and store the information on the blockchain.
* [OpenZeppelin](https://docs.openzeppelin.com/contracts): library for secure smart contract development for the ERC721 standard and other libraries such as Ownable, Pausable, Counters, EnumerableSet and ReentrancyGuard.
* [The Graph Protocol](https://thegraph.com): subgraph to retrieve and query the smart contract's information.
* [IPFS](https://ipfs.io): protocol to pin the NFT metadata to [Graph Node](https://api.thegraph.com/ipfs).
* [Ethers.js](https://docs.ethers.io): library to interact with the smart contracts from the front-end web app.
* [Next.js](https://nextjs.org): front-end framework (based on React) to provide an interface for the user to interact with the smart contracts and read their information from the subgraph.
* [Vercel](https://vercel.com): framework to deploy the front-end (Next.js) application to production.

## Features

* Mint (create) NFTs with random metadata.
* Manage a whitelist for NFT colllections to be able use the marketplace.
* List and buy NFTs on the marketplace.
* Track the marketplace and users' activity.

## Set up

This project has been launched on BNB Chain Testnet. You can use another a different network by updating `constants/global.js` on the web app and the `subgraph.yaml` and `networks.json` on the subgraph.

#### NFT Collection and Marketplace on Solidity

You can find the code in [contracts](/contracts) folder and use [Remix](https://remix.ethereum.org) to compile and deploy the smart contracts (0.8.7+ version). The marketplace contract must be deployed first so then its contract address can be passed as parameter to the NFT contract's constructor.


```solidity
//NFT contract 

contract PCNFTCollection is ERC721URIStorage, Ownable {

  address public marketplaceContract;   
  uint256 public MAX_TOKENS;

  constructor(
        address _marketplaceContract, 
        uint256 _maxTokens
  ) ERC721("Platas Crypto Collection", "PCC") 
  {
      marketplaceContract = _marketplaceContract;
      MAX_TOKENS = _maxTokens;
  }
...
```

#### Subgraph with The Graph Protocol

You'll need to have [Node.js](https://nodejs.org) installed in your machine to use Graph CLI.

To get started, open The Graph [dashboard](https://thegraph.com/hosted-service/dashboard) (sing-in or create a new account) and click on __Add Subgraph__ to create a new subgraph. Then, you'll need to enter a Subgraph name and subtitle. Once it's created you can initialise and deploy it using Graph CLI. For more information read the docs [here](https://thegraph.com/docs/en/developing/defining-a-subgraph)).

The subgraph will index 5 entities defined in __schema.graphl__. `Token` stores the information of each minted NFT. `Item` contains the data of the listings. `Trade` is used to store the marketpalce and users' activity when interacting with the marketplace (list, update, cancel and buy NFTs). `Collection` has the NFT collection address and its creator. Lastly, `User` registers the information of all the users with their NFTs, listings and trades.

```graphql
type Token @entity {
  "unique token identifier and primary key"
  id: ID!
  "id of nft token"
  tokenId: BigInt!
  "collection of nft token"
  collection: Collection!
  "user object of owner"
  owner: User!
  "name of nft token"
  name: String
  "description of nft token"
  description: String
  "url of nft token"
  image: String
  "ipfs metadata"
  metadata: String!
  "timestamp of minting date"
  createdAt: BigInt!
}

type Item @entity {
  "unique item identifier and primary key"
  id: ID!
  "nft token object"
  token: Token!
  "user object of seller of nft token"
  seller: User!
  "user object of buyer of nft token"
  buyer: User
  "price of nft token"
  price: BigInt!
  "timestamp of item creation"
  createdAt: BigInt!
  "timestamp of last item update"
  updatedAt: BigInt!
  "timestamp of item deletion"
  removedAt: BigInt!
  "timestamp of item sale"
  soldAt: BigInt!
}

type Collection @entity {
  "unique collection identifier and primary key"
  id: ID!
  "user object of creator of collection"
  creator: User
  "whether the collection is allowed to use the marketplace"
  isAllowed: Boolean! 
  "timestamp of collection creation"
  createdAt: BigInt!
  "timestamp of last collection update"
  updatedAt: BigInt!
  "timestamp of collection deletion"
  removedAt: BigInt!
   "list of tokens of collection"
  tokens: [Token!]! @derivedFrom(field: "collection")
}

type Trade @entity {
  "unique trade identifier and primary key"
  id: ID!
  "type of trade"
  type: String!
  "source of trade"
  from: User!
  "destination of trade"
  to: User!
  "value of trade if any"
  price: BigInt
  "item traded"
  item: Item!
  "trade hash"
  hash: String!
  "timestamp of trade creation"
  createdAt: BigInt!
}

type User @entity {
  "unique user identifier and primary key"
  id: ID!
  "amount paid for nft tokens"
  deposited: BigInt!
  "pending amount to withdraw from sales"
  pendingToWithdraw: BigInt!
  "total amount already withdrawn from sales"
  withdrawn: BigInt!
  tokens: [Token!]! @derivedFrom(field: "owner")
  items: [Item!]! @derivedFrom(field: "seller")
  collections: [Collection!]! @derivedFrom(field: "creator")
  trades: [Trade!]! @derivedFrom(field: "from")  
}
```

#### IPFS

The NFTs' metadata is stored on IPFS by pinning it to [Graph IPFS Node](https://api.thegraph.com/ipfs) so that the subgraph can read the corresponding files from IPFS using `ipfs.cat` when `NFTMinted` event is executed. Since `ipfs.cat` is not deterministic yet (read more [here](https://thegraph.com/docs/en/developing/assemblyscript-api/#ipfs-api)) files must be pinned or synced to Graph IPFS Node to avoid getting a null result due to time-out response and not retrieven its content.

````javascript
// /website/utils/ipfs.js

const theGraphNodeUrl = new URL('https://api.thegraph.com/ipfs');

const ipfs = create({
    protocol: theGraphNodeUrl.protocol,
    host: theGraphNodeUrl.hostname,
    port: 443,
    apiPath: theGraphNodeUrl.pathname + '/api/v0'
});

export const pinJSONToIPFS = async (url, name, description) => {

    if (!name || !description || !url) return { success: false, result: "Invalid NFT metadata." }

    //create metadata's object
    const metadata = new Object({ name: name, image: url, description: description })

    try {
        const result = await ipfs.add(JSON.stringify(metadata));
        return { success: true, result: "ipfs://" + result.path }

    } catch (error) {
        return { success: false, result: "An error occured while pinning the NFT metadata to IPFS." }
    }

}
````

#### Web App on Next.js

To interact with the smart contracts and retrieve their data from the subgraph I've built a simple web application on Next.js. From this application, users can mint new NFTs and interact with the marketplace to list their NFTs, update and cancel their listings, and buy NFTs from other users. When clonning the repository you'll need to run `npm install` to install its dependencies. The logic has been defined in the [utils](website/utils) folder within the following files:

* [auxiliary.js](website/utils/auxiliary.js): secondary functions to sanitise data, generate random images and texts for the NFTs and convert dates, among others.
* [interact.js](website/utils/interact.js): contains the smart contract addresses and the functions to interact with the contracts.
* [ipfs.js](website/utils/ipfs.js): to pin the NFTs metadata and obtain the new CID before minting new NFTs through Graph IPFS Node.
* [subgraph.js](website/utils/subgraph.js): queries and functions to call the subgraph and retrieve the data soted on the smart contracts.
