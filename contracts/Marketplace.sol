// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract Marketplace is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _marketItemIds;
    CountersUpgradeable.Counter private _collectionIds;
    CountersUpgradeable.Counter private _tokensSold;
    CountersUpgradeable.Counter private _tokensCanceled;
    CountersUpgradeable.Counter private _activeCollections;

    mapping(uint256 => MarketItem) private marketItemIdToMarketItem;
    mapping(uint256 => Collection) private collectionIdToCollection;
    mapping(address => mapping(uint256 => bool))
        private addressToCollectionToReported;

    struct MarketItem {
        uint256 marketItemId;
        address NFTContractAddress;
        uint256 tokenId;
        address payable creator;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        bool canceled;
    }

    struct Collection {
        string name;
        string description;
        uint256 collectionId;
        uint256[] marketIds;
        address creator;
        bool active;
        uint256 reportCount;
    }

    event MarketItemCreated(
        uint256 indexed marketItemId,
        address indexed NFTContract,
        uint256 indexed tokenId,
        address creator,
        address seller,
        address owner,
        uint256 price,
        bool sold,
        bool canceled
    );

    event countMessage(
        uint256 itemsCount,
        uint256 soldCount,
        uint256 canceledItemsCount,
        uint256 availableCount
    );

    event ownerAddress(address thisContractAddress);

    uint256 private listingFee;

    function initialize() public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init();
        listingFee = 0 wei;
    }

    function updateListingFee(uint256 _listingFee) public onlyOwner {
        listingFee = _listingFee;
    }

    function getListingFee() public view returns (uint256) {
        return listingFee;
    }

    function createCollection(
        string memory _name,
        string memory _description,
        uint256[] memory _marketIdsArray
    ) public {
        //check if all marketIds are created by sender
        for (uint256 i = 0; i < _marketIdsArray.length; i++) {
            require(
                marketItemIdToMarketItem[_marketIdsArray[i]].creator ==
                    msg.sender,
                "You must be the listing creator."
            );
        }
        uint256 collectionId = _collectionIds.current();
        collectionIdToCollection[collectionId] = Collection(
            _name,
            _description,
            collectionId,
            _marketIdsArray,
            msg.sender,
            true,
            0
        );
        _collectionIds.increment();
        _activeCollections.increment();
    }

    function delistCollection(uint256 _collectionId) public {
        require(
            _collectionId >= 0 && _collectionId < _collectionIds.current(),
            "Collection with that ID dosnt exist."
        );
        require(
            collectionIdToCollection[_collectionId].active,
            "Collection already delisted"
        );
        require(
            collectionIdToCollection[_collectionId].creator == msg.sender,
            "Not the creator of that Collection."
        );
        collectionIdToCollection[_collectionId].active = false;
        _activeCollections.decrement();
    }

    function reportCollection(uint256 _collectionId) public {
        Collection memory targetCollection = collectionIdToCollection[
            _collectionId
        ];
        require(
            addressToCollectionToReported[msg.sender][_collectionId] == false,
            "You've already reported this collection."
        );
        addressToCollectionToReported[msg.sender][_collectionId] = true;
        targetCollection.reportCount++;

        if (targetCollection.reportCount > 1) {
            targetCollection.active = false;
            _activeCollections.decrement();
        }

        collectionIdToCollection[_collectionId] = targetCollection;
    }

    function getActiveCollections() public view returns (Collection[] memory) {
        Collection[] memory activeCollections = new Collection[](
            _activeCollections.current()
        );

        uint256 activeCounter = 0;

        for (uint256 i = 0; i < _collectionIds.current(); i++) {
            if (collectionIdToCollection[i].active) {
                activeCollections[activeCounter] = collectionIdToCollection[i];
                activeCounter++;
            }
        }
        return activeCollections;
    }

    function createMarketItem(
        address NFTContractAddress,
        uint256 tokenId,
        uint256 price
    ) public payable returns (uint256) {
        require(price > 0, "Price must be at least 1 wei");
        require(
            msg.value == listingFee,
            "Price must be equal to listing price"
        );
        uint256 marketItemId = _marketItemIds.current();
        _marketItemIds.increment();

        address creator = ERC721Upgradeable(NFTContractAddress).ownerOf(
            tokenId
        );

        marketItemIdToMarketItem[marketItemId] = MarketItem(
            marketItemId,
            NFTContractAddress,
            tokenId,
            payable(creator),
            payable(msg.sender),
            payable(address(this)),
            price,
            false,
            false
        );

        ERC721Upgradeable(NFTContractAddress).transferFrom(
            msg.sender,
            address(this),
            tokenId
        );

        emit MarketItemCreated(
            marketItemId,
            NFTContractAddress,
            tokenId,
            payable(creator),
            payable(msg.sender),
            payable(address(this)),
            price,
            false,
            false
        );

        return marketItemId;
    }

    function cancelMarketItem(address NFTContractAddress, uint256 marketItemId)
        public
        payable
    {
        uint256 tokenId = marketItemIdToMarketItem[marketItemId].tokenId;
        require(tokenId >= 0, "Market item has to exist");

        require(
            marketItemIdToMarketItem[marketItemId].seller == msg.sender,
            "You are not the seller"
        );

        ERC721Upgradeable(NFTContractAddress).transferFrom(
            address(this),
            msg.sender,
            tokenId
        );

        marketItemIdToMarketItem[marketItemId].owner = payable(msg.sender);
        marketItemIdToMarketItem[marketItemId].canceled = true;

        _tokensCanceled.increment();
    }

    function getLatestMarketItemByTokenId(uint256 tokenId)
        public
        view
        returns (MarketItem memory, bool)
    {
        uint256 itemsCount = _marketItemIds.current();

        for (uint256 i = itemsCount - 1; i >= 0; i--) {
            MarketItem memory item = marketItemIdToMarketItem[i];
            if (item.tokenId != tokenId) continue;
            return (item, true);
        }
        MarketItem memory emptyMarketItem;
        return (emptyMarketItem, false);
    }

    function createMarketSale(address NFTContractAddress, uint256 marketItemId)
        public
        payable
    {
        uint256 price = marketItemIdToMarketItem[marketItemId].price;
        uint256 tokenId = marketItemIdToMarketItem[marketItemId].tokenId;
        require(
            msg.value == price,
            "Please submit the asking price in order to continue"
        );

        marketItemIdToMarketItem[marketItemId].owner = payable(msg.sender);
        marketItemIdToMarketItem[marketItemId].sold = true;

        marketItemIdToMarketItem[marketItemId].seller.transfer(msg.value);
        ERC721Upgradeable(NFTContractAddress).transferFrom(
            address(this),
            msg.sender,
            tokenId
        );

        _tokensSold.increment();

        payable(owner()).transfer(listingFee);
    }

    function fetchAvailableMarketItems()
        public
        view
        returns (MarketItem[] memory)
    {
        uint256 itemsCount = _marketItemIds.current();
        uint256 soldItemsCount = _tokensSold.current();
        uint256 canceledItemsCount = _tokensCanceled.current();
        uint256 availableItemsCount = itemsCount -
            (soldItemsCount + canceledItemsCount);
        MarketItem[] memory marketItems = new MarketItem[](availableItemsCount);
        uint256 arrayCounter = 0;

        for (uint256 i = 0; i < itemsCount; i++) {
            MarketItem memory item = marketItemIdToMarketItem[i];
            if (item.owner != address(this)) continue;
            marketItems[arrayCounter] = item;
            arrayCounter++;
        }
        return marketItems;
    }

    function compareStrings(string memory a, string memory b)
        private
        pure
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }

    function getMarketItemAddressByProperty(
        MarketItem memory item,
        string memory property
    ) private pure returns (address) {
        require(
            compareStrings(property, "seller") ||
                compareStrings(property, "owner"),
            "Parameter must be 'seller' or 'owner'"
        );

        return compareStrings(property, "seller") ? item.seller : item.owner;
    }

    function fetchSellingMarketItems()
        public
        view
        returns (MarketItem[] memory)
    {
        return fetchMarketItemsByAddressProperty("seller");
    }

    function fetchOwnedMarketItems() public view returns (MarketItem[] memory) {
        return fetchMarketItemsByAddressProperty("owner");
    }

    function fetchMarketItemsByAddressProperty(string memory _addressProperty)
        public
        view
        returns (MarketItem[] memory)
    {
        require(
            compareStrings(_addressProperty, "seller") ||
                compareStrings(_addressProperty, "owner"),
            "Parameter must be 'seller' or 'owner'"
        );
        uint256 totalItemsCount = _marketItemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemsCount; i++) {
            MarketItem storage item = marketItemIdToMarketItem[i];
            address addressPropertyValue = getMarketItemAddressByProperty(
                item,
                _addressProperty
            );
            if (addressPropertyValue != msg.sender) continue;
            itemCount += 1;
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint256 i = 0; i < totalItemsCount; i++) {
            MarketItem storage item = marketItemIdToMarketItem[i];
            address addressPropertyValue = getMarketItemAddressByProperty(
                item,
                _addressProperty
            );
            if (addressPropertyValue != msg.sender) continue;
            items[currentIndex] = item;
            currentIndex += 1;
        }

        return items;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}
}
