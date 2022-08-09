import { BigInt, dataSource, ByteArray, log } from "@graphprotocol/graph-ts"
import { CollectionCreated, CollectionRemoved, CollectionUpdated, ItemCanceled, ItemListed, ItemSold, ItemUpdated } from "../generated/MyMarketplace/Marketplace"
import { Nft } from "../generated/MyNFTMinter/Nft"
import { Token, Item, User, Trade, Collection } from "../generated/schema"

// ITEMS
export function handleItemListed(event: ItemListed): void {

    let token = Token.load(event.params.tokenId.toString())
    if (!token) return

    let item = Item.load(event.params.id.toString());

    if (!item) {
        item = new Item(event.params.id.toString())
        item.token = token.id
        item.seller = event.params.seller.toHexString()
        item.buyer = new ByteArray(0).toHexString()
        item.price = event.params.price
        item.createdAt = event.block.timestamp
        item.updatedAt = new BigInt(0)
        item.soldAt = new BigInt(0)
        item.removedAt = new BigInt(0)
    }

    let seller = User.load(event.params.seller.toHexString())
    let marketplace = User.load(dataSource.address().toHexString())

    if (!seller) {
        seller = new User(event.params.seller.toHexString())
        seller.deposited = new BigInt(0)
        seller.pendingToWithdraw = new BigInt(0)
        seller.withdrawn = new BigInt(0)
    }
    if (!marketplace) {
        marketplace = new User(dataSource.address().toHexString())
        marketplace.deposited = new BigInt(0)
        marketplace.pendingToWithdraw = new BigInt(0)
        marketplace.withdrawn = new BigInt(0)
    }

    let trade = Trade.load(event.params._event.transaction.hash.toHexString())

    if (!trade) {
        trade = new Trade(event.params._event.transaction.hash.toHexString())
        trade.type = "List"
        trade.from = seller.id
        trade.to = marketplace.id
        trade.item = item.id
        trade.price = event.params.price
        trade.hash = event.params._event.transaction.hash.toHexString()
        trade.createdAt = event.block.timestamp
    }

    item.save()
    seller.save()
    marketplace.save()
    trade.save()
}

export function handleItemUpdated(event: ItemUpdated): void {

    let item = Item.load(event.params.id.toString());
    if (!item) return

    item.price = event.params.price
    item.updatedAt = event.block.timestamp

    let seller = User.load(item.seller)
    if (!seller) return
    let marketplace = User.load(dataSource.address().toHexString())
    if (!marketplace) return

    let trade = Trade.load(event.params._event.transaction.hash.toHexString())
    if (trade) return

    trade = new Trade(event.params._event.transaction.hash.toHexString())
    trade.type = "Update"
    trade.from = seller.id
    trade.to = marketplace.id
    trade.item = item.id
    trade.price = event.params.price
    trade.hash = event.params._event.transaction.hash.toHexString()
    trade.createdAt = event.block.timestamp

    item.save()
    trade.save()
}

export function handleItemCanceled(event: ItemCanceled): void {

    let item = Item.load(event.params.id.toString())
    if (!item) return

    item.removedAt = event.block.timestamp

    let _from = User.load(item.seller)
    if (!_from) return

    let _to = User.load(dataSource.address().toHexString())
    if (!_to) return

    let trade = Trade.load(event.params._event.transaction.hash.toHexString())
    if (trade) return

    trade = new Trade(event.params._event.transaction.hash.toHexString())
    trade.type = "Remove"
    trade.from = _from.id
    trade.to = _to.id
    trade.item = item.id
    trade.hash = event.params._event.transaction.hash.toHexString()
    trade.createdAt = event.block.timestamp

    item.save()
    trade.save()

}

export function handleItemSold(event: ItemSold): void {

    // Item
    let item = Item.load(event.params.id.toString());
    if (!item) return

    let seller = User.load(item.seller)
    if (!seller) return

    let buyer = User.load(event.params.buyer.toHexString());
    if (!buyer) {
        buyer = new User(event.params.buyer.toHexString())
        buyer.deposited = new BigInt(0)
        buyer.pendingToWithdraw = new BigInt(0)
        buyer.withdrawn = new BigInt(0)
    }

    item.buyer = buyer.id
    item.soldAt = event.block.timestamp

    // Token
    let token = Token.load(event.params.tokenId.toString());
    if (!token) return
    token.owner = buyer.id

    // Trade
    let trade = Trade.load(event.params._event.transaction.hash.toHexString())
    if (trade) return

    trade = new Trade(event.params._event.transaction.hash.toHexString())
    trade.type = "Sale"
    trade.from = seller.id
    trade.to = buyer.id
    trade.item = item.id
    trade.price = event.params.price
    trade.hash = event.params._event.transaction.hash.toHexString()
    trade.createdAt = event.block.timestamp

    token.save()
    item.save()
    seller.save()
    buyer.save()
    trade.save()

}

// COLLECTIONS

export function handleCollectionCreated(event: CollectionCreated): void {

    let creator = User.load(event.params.creator.toHexString())

    if (!creator) {
        creator = new User(event.params.creator.toHexString())
        creator.deposited = new BigInt(0)
        creator.pendingToWithdraw = new BigInt(0)
        creator.withdrawn = new BigInt(0)
    }

    let collection = Collection.load(event.params.nftContract.toHexString())

    if (!collection) {
        collection = new Collection(event.params.nftContract.toHexString())
        //Access nft smart contract's state variables
        let NFTContract = Nft.bind(event.params.nftContract)
        collection.name = NFTContract.name()
        collection.symbol = NFTContract.symbol()
        collection.maxTokens = NFTContract.MAX_TOKENS()
        collection.creator = creator.id
        collection.isAllowed = event.params.isAllowed
        collection.createdAt = event.block.timestamp
        collection.updatedAt = new BigInt(0)
        collection.removedAt = new BigInt(0)
    }

    creator.save()
    collection.save()
}

export function handleCollectionUpdated(event: CollectionUpdated): void {

    let collection = Collection.load(event.params.nftContract.toHexString())
    if (!collection || collection.isAllowed == event.params.allowance) return

    collection.isAllowed = event.params.allowance
    collection.updatedAt = event.block.timestamp

    collection.save()
}

export function handleCollectionRemoved(event: CollectionRemoved): void {

    let collection = Collection.load(event.params.nftContract.toHexString())
    if (!collection) return

    collection.removedAt = event.block.timestamp

    collection.save()
}