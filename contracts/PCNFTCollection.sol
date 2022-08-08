// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract PCNFTCollection is ERC721URIStorage, Ownable, Pausable{

    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIds;
    using SafeMath for uint;
    
    address public marketplaceContract;    

    uint256 public MAX_TOKENS;

    /* Address => NFTs IDs */
    mapping(address => EnumerableSet.UintSet) private ownerToNFTs;

    event NFTMinted (uint indexed id, string tokenURI, address indexed owner);

    constructor(
        address _marketplaceContract, 
        uint256 _maxTokens
    ) ERC721("Platas Crypto Collection", "PCC") 
    {
        marketplaceContract = _marketplaceContract;
        MAX_TOKENS = _maxTokens;
    }    

    function mintNFT(
        address recipient, 
        string memory tokenURI
    ) public
        whenNotPaused
        returns (uint256)
    {
        require(!isMaxTokensReached(), "Maximum number of minted tokens already reached.");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(marketplaceContract, true);
        ownerToNFTs[recipient].add(newItemId);

        emit NFTMinted(newItemId, tokenURI, msg.sender); 

        return newItemId;
    }

    function updateTokenURI(
        uint256 _tokenId, 
        string memory _newURI
    ) external 
        onlyOwner
    {
        require(_exists(_tokenId), "Token does not exist.");

        _setTokenURI(_tokenId, _newURI);
    }        

    function updateMaxTokens(uint256 _newAmount) 
        external 
        onlyOwner
        returns(uint256)
    {
        require(_newAmount > 0 && _newAmount != MAX_TOKENS, "Not valid amount of tokens.");

        MAX_TOKENS = _newAmount;

        return MAX_TOKENS;
    }

    function isMaxTokensReached() public view returns (bool)
    {
        return (_tokenIds.current() >= MAX_TOKENS);
    }

    function getHolderNFTs(address _holder) 
        external view 
        returns (uint[] memory nfts)
    {
        nfts = new uint[](ownerToNFTs[_holder].length());  
        uint i;      
        for(i = 0; i < ownerToNFTs[_holder].length(); i = i.add(1)){
            nfts[i] =  ownerToNFTs[_holder].at(i);
        }
        
        return nfts;
    }
}