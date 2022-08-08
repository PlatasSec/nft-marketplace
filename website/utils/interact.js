import { pinJSONToIPFS } from "/utils/ipfs.js"
import { ethers } from 'ethers'
import { getHolderTokensFromSubgraph, getHolderNFTsOnSaleFromSubgraph, getMarketplaceItemsOnSaleFromSubgraph } from "./subgraph"
import { nft_contract_address, nft_contract_ABI, marketplace_contract_address, marketplace_contract_ABI } from "../constants/global"
import { _network, networkData } from "../constants/global"

function initEthereum() {
    const { ethereum } = window;

    if (!ethereum) return false;

    return ethereum;
}

export const connectWallet = async () => {

    const ethereum = initEthereum()
    if (!ethereum) return { success: false, result: "Please install Metamask." }

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")

        const { success } = await checkNetwork()
        if (!success) {
            window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: networkData,
            })

            return {
                success: false,
                result: "",
            }

        }

        const addressArray = await window.ethereum.request({
            method: "eth_requestAccounts"
        })

        if (addressArray.length > 0) {
            const userIsApprovedRequest = await checkIfApproved()

            const provider = new ethers.providers.Web3Provider(ethereum)
            var user_balance = await provider.getBalance(addressArray[0])
            user_balance = parseFloat(ethers.utils.formatEther(user_balance)).toFixed(3)

            return {
                success: true,
                result: { address: addressArray[0], isApproved: userIsApprovedRequest.success, balance: user_balance },
            }
        } else {
            return {
                success: false,
                result: ""
            }
        }
    } catch (err) {
        return {
            success: false,
            result: err.message
        }
    }
}

export const getCurrentWalletConnected = async () => {

    const ethereum = initEthereum()
    if (!ethereum) return { success: false, result: "Please install Metamask." }

    try {
        const { success } = await checkNetwork()
        if (!success) {
            window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: networkData,
            })

            return {
                success: false,
                result: "",
            }

        }

        const addressArray = await window.ethereum.request({
            method: "eth_accounts"
        })
        if (addressArray.length > 0) {
            const userIsApprovedRequest = await checkIfApproved()
            const provider = new ethers.providers.Web3Provider(ethereum)
            var user_balance = await provider.getBalance(addressArray[0])
            user_balance = parseFloat(ethers.utils.formatEther(user_balance)).toFixed(3)

            return {
                success: true,
                result: { address: addressArray[0], isApproved: userIsApprovedRequest.success, balance: user_balance },
            }
        } else {
            return {
                success: false,
                result: "",
            }
        }
    } catch (err) {
        return {
            success: false,
            result: err.message
        }
    }
}

export const checkNetwork = async () => {

    const ethereum = initEthereum()
    if (!ethereum) return { success: false, result: "Please install Metamask." }

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        const signer = provider.getSigner()
        const network = await provider.getNetwork()
        network = network['chainId'];

        if (network != _network.chainIdDecimal) {
            return {
                success: false,
                result: "Not connected to " + _network.chainName + ".",
            }
        }

        return {
            success: true,
            result: "Connected to " + _network.chainName + "."
        }

    } catch (err) {
        return {
            success: false,
            result: "An error occured while checking the network."
        }
    }
}

export const getHolderNFTs = async (user_wallet) => {

    const ethereum = initEthereum()
    if (!ethereum) return { success: false, result: "Please install Metamask." }

    try {
        const holderNFTsRequest = await getHolderTokensFromSubgraph(user_wallet)
        if (!holderNFTsRequest.success) return { success: false, result: holderNFTsRequest.result }

        // Get ALL the user's nft collected
        const holderNFTsResult = holderNFTsRequest.result

        if (holderNFTsResult.length == 0) return { success: true, result: [] }

        // Get the nfts on sale on the marketplace
        const itemsOnSaleRequest = await getMarketplaceItemsOnSaleFromSubgraph()
        const itemsOnSaleResult = itemsOnSaleRequest.result

        // Array with not on sale nfts
        var finalHolderNFTs = new Array()

        if (itemsOnSaleResult.length == 0) {
            finalHolderNFTs = holderNFTsResult
        } else if (itemsOnSaleResult.length > 0) {
            for (let j = 0; j < holderNFTsResult.length; j++) {
                if (!itemsOnSaleResult.find(element => element.token.tokenId == holderNFTsResult[j].tokenId)) {
                    const nftNotOnSale = Object.assign({}, holderNFTsResult[j])
                    finalHolderNFTs.push(nftNotOnSale)
                }
            }
        }

        return { success: true, result: finalHolderNFTs }

    } catch (error) {
        return {
            success: false,
            result: "An error occured while getting your NFTs."
        }
    }
}

export const getHolderNFTsOnSale = async (user_wallet) => {

    const ethereum = initEthereum()
    if (!ethereum) return { success: false, result: "Please install Metamask." }

    try {
        const { success, result } = await getHolderNFTsOnSaleFromSubgraph(user_wallet)
        return {
            success: success,
            result: result
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            result: error.message
        }
    }
}

export const mintNFT = async (url, name, description) => {

    const ethereum = initEthereum()
    if (!ethereum) return { success: false, result: "Please install Metamask." };

    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        var user_wallet = accounts[0];

        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()

        var nft = new ethers.Contract(nft_contract_address, nft_contract_ABI, provider)
        nft = nft.connect(signer)

        const isMaxTokensReached = await nft.functions.isMaxTokensReached()
        isMaxTokensReached = isMaxTokensReached[0]
        if (isMaxTokensReached) return { success: false, result: "Maximum number of minted tokens of this collection has been reached." }

        const pinataRequest = await pinJSONToIPFS(url, name, description)
        if (!pinataRequest.success) return pinataRequest

        const tokenURI = pinataRequest.result

        const mintResponse = await nft.functions.mintNFT(user_wallet, tokenURI, {
            from: user_wallet,
            nonce: await provider.getTransactionCount(user_wallet, "latest")
        }).then(async (transaction) => {
            while (await provider.getTransactionReceipt(transaction.hash) == null);
            return transaction.hash
        })

        return {
            success: true,
            result: "Check out your transaction on BscScan: https://testnet.bscscan.com/tx/" + mintResponse,
            hash: mintResponse
        }


    } catch (error) {

        console.log(error)

        return {
            success: false,
            result: error.message
        }
    }
}

export const addNFTToMarketplace = async (nft, price) => {

    console.log(nft)

    if (!nft || !price || price < 0) return

    const ethereum = initEthereum()
    if (!ethereum) return { success: false, result: "Please install Metamask." }

    try {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()

        var marketplace = new ethers.Contract(marketplace_contract_address, marketplace_contract_ABI, provider)
        marketplace = marketplace.connect(signer)

        // Check if collection is allowed
        const currentCollection = await marketplace.functions.getCollection(nft.collection.id)
        currentCollection = currentCollection[0]
        if (!currentCollection.isAllowed) return { success: false, result: "NFT collection not allowed to use the marketplace." }
        // Check if the user has already approved
        const ifApprovedResult = await checkIfApproved(nft.tokenId)
        if (!ifApprovedResult.success) return { success: ifApprovedResult.success, result: ifApprovedResult.result }

        const addNFTResponse = await marketplace.functions.listItem(
            nft.collection.id, nft.id, price)
            .then(async (transaction) => {
                while (await provider.getTransactionReceipt(transaction.hash) == null);
                return transaction.hash
            })
        return {
            success: true,
            result: "Your NFT has successfully been added to the marketplace",
            hash: addNFTResponse
        }

    } catch (error) {

        console.log(error)

        return {
            success: false,
            result: "An error occurred while adding your NFT to the marketplace."
        }
    }
}

export const buyNFT = async (item) => {

    console.log(item)

    if (!item) return

    const ethereum = initEthereum()
    if (!ethereum) return { success: false, result: "Please install Metamask." }

    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        var user_wallet = accounts[0];

        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()

        var marketplace = new ethers.Contract(marketplace_contract_address, marketplace_contract_ABI, provider)
        marketplace = marketplace.connect(signer)

        // Check if collection is allowed
        const currentCollection = await marketplace.functions.getCollection(item.token.collection.id)
        currentCollection = currentCollection[0]
        if (!currentCollection.isAllowed) return { success: false, result: "NFT collection not allowed to use the marketplace." }
        // Check if user has enough balance to purchase the nft
        var user_balance = await provider.getBalance(user_wallet)
        if (parseInt(user_balance) < item.price) {
            return {
                success: false,
                result: "Not enough balance to purchase this NFT.",
            }
        }

        user_balance = parseFloat(ethers.utils.formatEther(user_balance))

        console.log(item.id, item.token.collection.id)

        const buyResponse = await marketplace.functions.buyItem(
            item.token.collection.id, item.token.tokenId, {
            from: user_wallet,
            value: item.price,
            nonce: await provider.getTransactionCount(user_wallet, "latest")
        }).then(async (transaction) => {
            while (await provider.getTransactionReceipt(transaction.hash) == null);
            return transaction.hash
        })


        return {
            success: true,
            result: "Congratulations! You have successfully purchased the NFT.",
            hash: buyResponse
        }

    } catch (error) {
        console.log(error)
        return {
            success: false,
            result: "An error occured when executing your request."
        }
    }
}

export const withdraw = async () => {

    const ethereum = initEthereum()
    if (!ethereum) return { success: false, result: "Please install Metamask." }

    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        var user_wallet = accounts[0];

        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()

        var marketplace = new ethers.Contract(marketplace_contract_address, marketplace_contract_ABI, provider)
        marketplace = marketplace.connect(signer)

        const userPayments = await marketplace.functions.payments(user_wallet)

        if (userPayments <= 0) return { success: false, result: "Nothing to withdraw." }

        const withdrawRequest = await marketplace.functions.withdrawPayments(user_wallet).then(async (transaction) => {
            while (await provider.getTransactionReceipt(transaction.hash) == null);
            return transaction.hash
        })

        return {
            success: true,
            result: "You have successfully withdrawn your payments.",
            hash: withdrawRequest
        }

    } catch (error) {
        console.log(error)
        return {
            success: false,
            result: "An error occured while executing your withdrawal."
        }
    }
}

export const updateItemToMarketplace = async (item, newPrice) => {

    const ethereum = initEthereum()
    if (!ethereum) return { success: false, result: "Please install Metamask." }

    try {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()

        var marketplace = new ethers.Contract(marketplace_contract_address, marketplace_contract_ABI, provider)
        marketplace = marketplace.connect(signer)

        // Check if collection is allowed
        const currentCollection = await marketplace.functions.getCollection(item.token.collection.id)
        currentCollection = currentCollection[0]
        if (!currentCollection.isAllowed) return { success: false, result: "NFT collection not allowed to use the marketplace." }
        // Check if the user has already approved
        const ifApprovedResult = await checkIfApproved(item.token.tokenId)
        if (!ifApprovedResult.success) return { success: ifApprovedResult.success, result: ifApprovedResult.result }

        const updateItemResponse = await marketplace.functions.updateItem(nft_contract_address, item.token.tokenId, newPrice)
            .then(async (transaction) => {
                while (await provider.getTransactionReceipt(transaction.hash) == null);
                return transaction.hash
            })
        return {
            success: true,
            result: "Your NFT has successfully been updated.",
            hash: updateItemResponse
        }

    } catch (error) {

        return {
            success: false,
            result: "An error occured while updating your NFT."
        }
    }
}

export const removeItemFromMarketplace = async (item) => {

    if (!item) return { success: false, result: "An error occurred with this item. Please, try again later." }

    const ethereum = initEthereum()
    if (!ethereum) return { success: false, result: "Please install Metamask." }

    try {

        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()

        var marketplace = new ethers.Contract(marketplace_contract_address, marketplace_contract_ABI, provider)
        marketplace = marketplace.connect(signer)

        const cancelItemResponse = await marketplace.functions.cancelItem(item.token.collection.id, item.token.tokenId)
            .then(async (transaction) => {
                while (await provider.getTransactionReceipt(transaction.hash) == null);
                return transaction.hash
            })


        return {
            success: true,
            result: "Your NFT has successfully been removed from the Marketplace.",
            hash: cancelItemResponse
        }

    } catch (error) {

        return {
            success: false,
            result: error.message
        }
    }
}

export const checkIfApproved = async () => {

    const ethereum = initEthereum()
    if (!ethereum) return { success: false, result: "Please install Metamask." }

    try {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()

        const addressArray = await window.ethereum.request({
            method: "eth_accounts"
        })
        if (addressArray.length == 0) return

        var nft = new ethers.Contract(nft_contract_address, nft_contract_ABI, provider)
        nft = nft.connect(signer)

        const ifApprovedResult = await nft.functions.isApprovedForAll(addressArray[0], marketplace_contract_address)

        ifApprovedResult = ifApprovedResult[0]

        if (ifApprovedResult) {
            return {
                success: true,
                result: "Already approved.",
            }
        } else {
            return {
                success: false,
                result: "You must approve first.",
            }
        }

    } catch (error) {
        console.log(error)

        return {
            success: false,
            result: error.message
        }
    }
}

export const approveToMarketplace = async () => {

    const ethereum = initEthereum()
    if (!ethereum) return { success: false, result: "Please install Metamask." }

    try {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()

        var nft = new ethers.Contract(nft_contract_address, nft_contract_ABI, provider)
        nft = nft.connect(signer)

        const approveResponse = await nft.functions.setApprovalForAll(marketplace_contract_address, true)
            .then(async (transaction) => {
                while (await provider.getTransactionReceipt(transaction.hash) == null);
                return transaction.hash
            })

        return {
            success: true,
            result: "You have successfully approved. Please, now click the SELL button."
        }

    } catch (error) {
        console.log(error)
        return {
            success: false,
            result: "An error occured with your approval request."
        }
    }
}