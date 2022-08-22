import { json, ipfs, BigInt, dataSource, ByteArray, log } from "@graphprotocol/graph-ts"
import { NFTMinted, Nft, MaxTokensUpdated, NFTTokenURIUpdated } from "../generated/MyNFTMinter/Nft"
import { Token, User, Collection } from "../generated/schema"

export function handleNFTMinted(event: NFTMinted): void {

  let collection = Collection.load(dataSource.address().toHexString())

  if (!collection) {
    collection = new Collection(dataSource.address().toHexString())
    //Access nft smart contract's state variables
    let NFTContract = Nft.bind(dataSource.address())
    collection.name = NFTContract.name()
    collection.symbol = NFTContract.symbol()
    collection.maxTokens = NFTContract.MAX_TOKENS()
    collection.isAllowed = false
    collection.createdAt = new BigInt(0)
    collection.updatedAt = new BigInt(0)
    collection.removedAt = new BigInt(0)
  }

  let token = Token.load(event.params.id.toString())
  if (!token) {
    token = new Token(event.params.id.toString())
    token.tokenId = event.params.id
    token.collection = collection.id
    token.owner = event.params.owner.toHexString()
    token.createdAt = event.block.timestamp;
    token.metadata = event.params.tokenURI.toString()

    let metadataResult = ipfs.cat(event.params.tokenURI.toString().replace("ipfs://", ""))

    if (metadataResult) {
      // const value = json.fromBytes(metadataResult).toObject()
      const request_ = json.try_fromBytes(metadataResult)
      if (request_.isOk && request_.value.toObject().get('image') && request_.value.toObject().get('name') && request_.value.toObject().get('description')) {
        const value = request_.value.toObject()
        const image = value.get('image')
        if (image) {
          token.image = image.toString()
        }
        const name = value.get('name')
        if (name) {
          token.name = name.toString()
        }
        const description = value.get('description')
        if (description) {
          token.description = description.toString()
        }
      } else {
        // Default metadata
        token.metadata = "ipfs://default"
        token.image = "https://i.picsum.photos/id/967/428/524.jpg?hmac=ymBqh0LcQI2VEcwvianX5bY6WbA-LjrW7MkykXJDsCs"
        token.name = "Default"
        token.description = "Laborum in ex ullamco aliqua aliquip elit ex consectetur. Enim duis adipisicing ea esse ipsum. Commodo ullamco aliqua et commodo culpa sit duis minim occaecat. Ex occaecat pariatur magna proident minim et anim et adipisicing."
      }
    } else {
      // Default metadata
      token.metadata = "ipfs://default"
      token.image = "https://i.picsum.photos/id/967/428/524.jpg?hmac=ymBqh0LcQI2VEcwvianX5bY6WbA-LjrW7MkykXJDsCs"
      token.name = "Default"
      token.description = "Laborum in ex ullamco aliqua aliquip elit ex consectetur. Enim duis adipisicing ea esse ipsum. Commodo ullamco aliqua et commodo culpa sit duis minim occaecat. Ex occaecat pariatur magna proident minim et anim et adipisicing."
    }

  }

  let user = User.load(event.params.owner.toString())
  if (!user) {
    user = new User(event.params.owner.toHexString())
    user.deposited = new BigInt(0)
    user.pendingToWithdraw = new BigInt(0)
    user.withdrawn = new BigInt(0)
  }

  collection.save()
  token.save()
  user.save()
}

export function handleMaxTokensUpdated(event: MaxTokensUpdated): void {

  let collection = Collection.load(dataSource.address().toHexString())

  if (!collection || collection.maxTokens == event.params.newAmount) return

  collection.maxTokens = event.params.newAmount

  collection.save()
}

export function handleTokenURIUpdated(event: NFTTokenURIUpdated): void {

  let token = Token.load(event.params.id.toString())

  if (!token || token.metadata == event.params.tokenURI) return

  token.metadata = event.params.tokenURI

  let metadataResult = ipfs.cat(event.params.tokenURI.toString().replace("ipfs://", ""))

  if (!metadataResult) return

  const value = json.fromBytes(metadataResult).toObject()
  if (value) {
    const image = value.get('image')
    if (image) {
      token.image = image.toString()
    }
    const name = value.get('name')
    if (name) {
      token.name = name.toString()
    }
    const description = value.get('description')
    if (description) {
      token.description = description.toString()
    }
  }

  token.save()
}

