// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract PCMarketplace is Ownable, ERC721Holder, Pausable, ReentrancyGuard, PullPayment {

    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using Counters for Counters.Counter;
    using SafeMath for uint;

    Counters.Counter public _itemsIds; // Item ids counter
    Counters.Counter public _itemsOnSale; // Total items on sale
    Counters.Counter public _itemsSold; // Total items sold

    struct Collection 
    {
        address nftContract;
        address creator;
        bool isAllowed;
        uint256 updatedAt;
        uint256 createdAt;
    }

    struct Item 
    {
        uint id;
        uint256 tokenId;
        address nftContract;
        address seller;
        address buyer;
        uint256 price;
        uint createdAt;
        uint updatedAt;
    }

    // Mappings
    mapping(address => Collection) private nftContractToCollection; // Information of collections
    mapping(address => EnumerableSet.AddressSet) private creatorToCollection; // List of collections of creators
    mapping(address => mapping(uint256 => Item)) private nftContractToItemListing; // Set of listings of a each collection
    mapping(address => uint256) private sellerToEarnings; // Details about users earnings

    // Events

    // Collections
    event CollectionCreated (address indexed nftContract, address indexed creator, bool isAllowed);
    event CollectionUpdated (address indexed nftContract, bool allowance);
    event CollectionRemoved (address indexed nftContract);

    // Items
    event ItemListed (uint indexed id, uint256 indexed tokenId, address indexed nftContract, address seller, uint256 price);
    event ItemUpdated ( uint indexed id, uint256 indexed tokenId, address indexed nftContract, uint256 price);
    event ItemCanceled (uint indexed id, uint256 indexed tokenId, address indexed nftContract, address seller);
    event ItemSold (uint indexed id, uint256 indexed tokenId, address nftContract, address indexed buyer, uint256 price);

    
    // Modifiers
    modifier collectionNotExists(address _nftContract)
    {
       require(nftContractToCollection[_nftContract].createdAt <= 0, "Collection already exists.");
        _;
    }

    modifier collectionExists(address _nftContract)
    {
       require(nftContractToCollection[_nftContract].createdAt > 0, "Collection does not exist.");
        _;
    }

    modifier isCollectionAllowed(address _nftContract)
    {
       require(nftContractToCollection[_nftContract].isAllowed, "Collection not allowed.");
        _;
    }

    modifier isItemListed(address _nftContract, uint256 _tokenId)
    {
       require(nftContractToItemListing[_nftContract][_tokenId].id > 0, "Item not listed yet.");
        _;
    }

    modifier notItemListed(address _nftContract, uint256 _tokenId)
    {
       require(nftContractToItemListing[_nftContract][_tokenId].id <= 0, "Item already listed.");
        _;
    }

    modifier isTokenOwner(address _nftContract, uint256 _tokenId, address _user)
    {
       IERC721 nft = IERC721(_nftContract);
       address owner = nft.ownerOf(_tokenId);
       require(_user == owner, "Not the owner of this token.");
        _;
    }

    modifier isTokenSeller(address _nftContract, uint256 _tokenId, address _user)
    {
       require(nftContractToItemListing[_nftContract][_tokenId].seller == _user, "Not the seller of this token.");
        _;
    }

    modifier notTokenSeller(address _nftContract, uint256 _tokenId, address _user)
    {
       require(nftContractToItemListing[_nftContract][_tokenId].seller != _user, "Seller of this token.");
        _;
    }

    // Collection functions: create, update, remove
    function createCollection(
        address _nftContract,
        address _creator,
        bool _isAllowed
    ) external 
        onlyOwner
        collectionNotExists(_nftContract)
    {
        require(IERC721(_nftContract).supportsInterface(0x80ac58cd), "Contract is not ERC721.");
        require(!creatorToCollection[_creator].contains(_nftContract), "Creator already has this collection.");

        creatorToCollection[_creator].add(_nftContract);        
        // Add new collection to collections mapping
        nftContractToCollection[_nftContract] = Collection({
            nftContract: _nftContract,
            creator: _creator,
            isAllowed: _isAllowed,
            updatedAt: 0,
            createdAt: block.timestamp
        });
        // Add new collection to creators' mapping
        creatorToCollection[_creator].add(_nftContract);

        emit CollectionCreated(_nftContract, _creator, _isAllowed);
    }

    function updateCollection(
        address _nftContract,
        bool _newAllowance
    ) external 
        onlyOwner
        collectionExists(_nftContract)
    {
        require(nftContractToCollection[_nftContract].isAllowed != _newAllowance, "Same allowance.");
        // Update collection's fields
        nftContractToCollection[_nftContract].isAllowed = _newAllowance;
        nftContractToCollection[_nftContract].updatedAt = block.timestamp;

        emit CollectionUpdated(_nftContract, _newAllowance);
    }

     function removeCollection (
        address _nftContract
    ) external 
        onlyOwner
        collectionExists(_nftContract)
    {
        Collection memory collection = nftContractToCollection[_nftContract];
        // Remove collection from collections' mapping
        delete nftContractToCollection[_nftContract];
        // Remove collection from creators' mapping
        creatorToCollection[collection.creator].remove(_nftContract);

        emit CollectionRemoved(collection.nftContract);         
    }
        

    // Item Functions: List, Update, Cancel, Buy
    function listItem(
        address _nftContract, 
        uint256 _tokenId,         
        uint256 _price
    ) external 
        nonReentrant 
        whenNotPaused 
        collectionExists(_nftContract)
        isCollectionAllowed(_nftContract)
        isTokenOwner(_nftContract, _tokenId, msg.sender)
        notItemListed(_nftContract,  _tokenId) 
    {        
        require(_tokenId > 0 , "Token id must be greater than zero.");
        require(_price > 0 , "Price must be greater than zero.");
        require(IERC721(_nftContract).isApprovedForAll(msg.sender, address(this)), "User has not approved yet.");    

        // Transfer NFT to this contract
        IERC721(_nftContract).safeTransferFrom(msg.sender, address(this), _tokenId);            

        _itemsIds.increment();
        uint256 itemId = _itemsIds.current();

        _itemsOnSale.increment();

        // Add new item to listings mapping
        nftContractToItemListing[_nftContract][_tokenId] = Item({
            id: itemId,
            tokenId: _tokenId,
            nftContract: _nftContract,
            seller: msg.sender,
            buyer: address(0),
            price: _price,
            createdAt: block.timestamp,
            updatedAt: 0
            }
        );    

        emit ItemListed(itemId, _tokenId, _nftContract, msg.sender, _price);           
    }

    function updateItem(
        address _nftContract,
        uint256 _tokenId, 
        uint256 _newPrice
        ) external 
        whenNotPaused
        nonReentrant
        collectionExists(_nftContract)
        isCollectionAllowed(_nftContract)
        isTokenSeller(_nftContract, _tokenId, msg.sender)
        isItemListed(_nftContract,  _tokenId) 
    {
        require(_newPrice > 0 && nftContractToItemListing[_nftContract][_tokenId].price != _newPrice, "Price cannot be zero and must be different from current value.");
        
        Item memory item = nftContractToItemListing[_nftContract][_tokenId];
        // Update item's fields
        nftContractToItemListing[_nftContract][_tokenId].price = _newPrice;
        nftContractToItemListing[_nftContract][_tokenId].updatedAt = block.timestamp;

        emit ItemUpdated(item.id, _tokenId, _nftContract, _newPrice);   
    }

    function cancelItem (
        address _nftContract,
        uint256 _tokenId     
    ) external 
        whenNotPaused
        isTokenSeller(_nftContract, _tokenId, msg.sender)
        isItemListed(_nftContract,  _tokenId) 
    {       
        _itemsOnSale.decrement();

        Item memory item = nftContractToItemListing[_nftContract][_tokenId];
        // Remove from mapping
        delete nftContractToItemListing[_nftContract][_tokenId]; 
        // Remove from listings mapping
        IERC721(_nftContract).safeTransferFrom(address(this), msg.sender, _tokenId);

        emit ItemCanceled(item.id,_tokenId,_nftContract,msg.sender);         
    }

    function buyItem(
        address _nftContract,
        uint256 _tokenId        
    ) external payable 
        whenNotPaused 
        nonReentrant 
        collectionExists(_nftContract)
        isCollectionAllowed(_nftContract)
        isItemListed(_nftContract,  _tokenId)
        notTokenSeller(_nftContract,  _tokenId, msg.sender)
    {
        require(msg.value == nftContractToItemListing[_nftContract][_tokenId].price, "Invalid amount.");

        _itemsSold.increment();
        _itemsOnSale.decrement();

        Item memory item = nftContractToItemListing[_nftContract][_tokenId];
        // Increment seller's earnings
        sellerToEarnings[item.seller] = sellerToEarnings[item.seller].add(item.price);
        // Remove from listings mapping
        delete nftContractToItemListing[_nftContract][_tokenId];        
        // Transfer buyer's funds to escrow contract with seller's address
        _asyncTransfer(item.seller, item.price);
        // Transfer NFT to buyer
        IERC721(_nftContract).safeTransferFrom(address(this), msg.sender, _tokenId);        

        emit ItemSold(item.id, _tokenId, _nftContract, msg.sender, msg.value);
    }

    // Returns the information of a given collection
    function getCollection(address _nftContract) 
        view public 
        returns(Collection memory)
    {
        return nftContractToCollection[_nftContract];
    }

    // Returns the collections addresses of a given creator
    function getCreatorCollections(address _creator) 
        view public 
        returns(address[] memory collections)
    {        
        require(creatorToCollection[_creator].length() > 0, "Collector does not exist.");

        collections = new address[](creatorToCollection[_creator].length());  

        uint i;      
        for(i = 0; i < creatorToCollection[_creator].length(); i = i.add(1)){
            collections[i] =  creatorToCollection[_creator].at(i);
        }

        return collections;        
    }

    // Returns whether the collection is allowed
    function getCollectionAllowance(address _nftContract) view public returns(bool)
    {
        return nftContractToCollection[_nftContract].isAllowed;
    }

    // Returns the information of the item of a given collection
    function getItem(address _nftContract, uint256 _tokenId)  view public  returns(Item memory)
    {
        return nftContractToItemListing[_nftContract][_tokenId];
    }

    // Returns the total amount earnt by the seller
    function getSellerEarnings(address _seller) view public returns(uint256)
    {
        return sellerToEarnings[_seller];        
    }

    // Returns whether the token is listed
    function checkIfTokenIsListed(address _nftContract, uint256 _tokenId) view public returns(bool)
    {       
        return (nftContractToItemListing[_nftContract][_tokenId].id > 0);        
    }

}