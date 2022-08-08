// Contracts 
const nft_contract_address = "0xA8af3D290EA6dd4C78C93e14e001DCDD2dCB8891"
const nft_contract_ABI = require("../contracts/nft-abi.json")
const marketplace_contract_address = "0xFC92a43795B5C15E9B73a9CB06362c9938D950A7"
const marketplace_contract_ABI = require("../contracts/marketplace-abi.json")

// Subgraph
const subgraphId = "QmRbYatA2qMrnPKC3mtCLqdAzQLuT7jRQahgKXY98BDwNh"

// Network
const _network = {
    name: "goerli",
    coin: "GoerliETH",
    chainId: "0x5",
    chainIdDecimal: "5",
    chainName: "Goerli (Ethereum Testnet)",
    rpcUrls: ["https://rpc.goerli.mudit.blog"],
    nativeCurrency: {
        name: "GoerliETH",
        symbol: "GoerliETH",
        decimals: 18,
    },
    logo: "/assets/img/eth_logo.svg",
    homePageLogo: "/assets/img/ethereum.svg",
    website: "https://goerli.net",
    explorer: {
        main: "https://goerli.etherscan.io/",
        transaction: "https://goerli.etherscan.io/tx/",
        address: "https://goerli.etherscan.io/address/",
        token: "https://goerli.etherscan.io/token/"
    }
}

const networkData = [
    {
        chainId: _network.chainId,
        chainName: _network.chainName,
        rpcUrls: _network.rpcUrls,
        nativeCurrency: _network.nativeCurrency,
        blockExplorerUrls: _network.explorer.main,
    },
]

// Toast 
const toastStyle = {
    border: '1px solid #B75CFF',
    padding: '16px',
    color: '#B75CFF',
    fontSize: '16px'
}

const toastIconTheme = {
    primary: '#B75CFF',
    secondary: '#671AE4'
}

export {
    nft_contract_address, nft_contract_ABI, marketplace_contract_address, marketplace_contract_ABI,
    _network, networkData,
    toastStyle, toastIconTheme,
    subgraphId
}