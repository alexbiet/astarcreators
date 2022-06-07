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
    CountersUpgradeable.Counter private _tokensSold;
    CountersUpgradeable.Counter private _tokensCanceled;

    mapping(uint256 => MarketItem) private marketItemIdToMarketItem;

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

    uint256 private listingFee;

    function initialize() initializer public {
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

  //transfer NFT from NFTcontract to MarketContract (this)
    function createMarketItem(
        address NFTContractAddress,
        uint256 tokenId,
        uint256 price
    ) public payable returns (uint256) {
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingFee, "Price must be equal to listing price");
        _marketItemIds.increment();
        uint256 marketItemId = _marketItemIds.current();

        address creator = ERC721Upgradeable(NFTContractAddress).ownerOf(tokenId);

        marketItemIdToMarketItem[marketItemId] = MarketItem(
            marketItemId,
            NFTContractAddress,
            tokenId,
            payable(creator),
            payable(msg.sender),
            payable(address(0)),
            price,
            false,
            false
        );

        ERC721Upgradeable(NFTContractAddress).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            marketItemId,
            NFTContractAddress,
            tokenId,
            payable(creator),
            payable(msg.sender),
            payable(address(0)),
            price,
            false,
            false
        );

        return marketItemId;
    }

    /**
     * @dev Cancel a market item
     */
    function cancelMarketItem(address NFTContractAddress, uint256 marketItemId) public payable {
        uint256 tokenId = marketItemIdToMarketItem[marketItemId].tokenId;
        require(tokenId > 0, "Market item has to exist");

        require(marketItemIdToMarketItem[marketItemId].seller == msg.sender, "You are not the seller");

        ERC721Upgradeable(NFTContractAddress).transferFrom(address(this), msg.sender, tokenId);

        marketItemIdToMarketItem[marketItemId].owner = payable(msg.sender);
        marketItemIdToMarketItem[marketItemId].canceled = true;

        _tokensCanceled.increment();
    }

    /**
     * @dev Get Latest Market Item by the token id
     */
    function getLatestMarketItemByTokenId(uint256 tokenId) public view returns (MarketItem memory, bool) {
        uint256 itemsCount = _marketItemIds.current();

        for (uint256 i = itemsCount; i > 0; i--) {
            MarketItem memory item = marketItemIdToMarketItem[i];
            if (item.tokenId != tokenId) continue;
            return (item, true);
        }

        // What is the best practice for returning a "null" value in solidity?
        // Reverting does't seem to be the best approach as it would throw an error on frontend
        MarketItem memory emptyMarketItem;
        return (emptyMarketItem, false);
    }

    /**
     * @dev Creates a market sale by transfering msg.sender money to the seller and NFT token from the
     * marketplace to the msg.sender. It also sends the listingFee to the marketplace owner.
     */
    function createMarketSale(address NFTContractAddress, uint256 marketItemId) public payable {
        uint256 price = marketItemIdToMarketItem[marketItemId].price;
        uint256 tokenId = marketItemIdToMarketItem[marketItemId].tokenId;
        require(msg.value == price, "Please submit the asking price in order to continue");

        marketItemIdToMarketItem[marketItemId].owner = payable(msg.sender);
        marketItemIdToMarketItem[marketItemId].sold = true;

        marketItemIdToMarketItem[marketItemId].seller.transfer(msg.value);
        ERC721Upgradeable(NFTContractAddress).transferFrom(address(this), msg.sender, tokenId);

        _tokensSold.increment();

        payable(owner()).transfer(listingFee);
    }

    /**
     * @dev Fetch non sold and non canceled market items
     */
    function fetchAvailableMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemsCount = _marketItemIds.current();
        uint256 soldItemsCount = _tokensSold.current();
        uint256 canceledItemsCount = _tokensCanceled.current();
        uint256 availableItemsCount = itemsCount - soldItemsCount - canceledItemsCount;
        MarketItem[] memory marketItems = new MarketItem[](availableItemsCount);

        uint256 currentIndex = 0;
        for (uint256 i = 0; i < itemsCount; i++) {
            MarketItem memory item = marketItemIdToMarketItem[i + 1];
            if (item.owner != address(0)) continue;
            marketItems[currentIndex] = item;
            currentIndex += 1;
        }

        return marketItems;
    }

    /**
     * @dev This seems to be the best way to compare strings in Solidity
     */
    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    /**
     * @dev Since we can't access structs properties dinamically, this function selects the address
     * we're looking for between "owner" and "seller"
     */
    function getMarketItemAddressByProperty(MarketItem memory item, string memory property)
        private
        pure
        returns (address)
    {
        require(
            compareStrings(property, "seller") || compareStrings(property, "owner"),
            "Parameter must be 'seller' or 'owner'"
        );

        return compareStrings(property, "seller") ? item.seller : item.owner;
    }

    /**
     * @dev Fetch market items that are being listed by the msg.sender
     */
    function fetchSellingMarketItems() public view returns (MarketItem[] memory) {
        return fetchMarketItemsByAddressProperty("seller");
    }

    /**
     * @dev Fetch market items that are owned by the msg.sender
     */
    function fetchOwnedMarketItems() public view returns (MarketItem[] memory) {
        return fetchMarketItemsByAddressProperty("owner");
    }

    /**
     * @dev Fetches market items according to the its requested address property that
     * can be "owner" or "seller". The original implementations were two functions that were
     * almost the same, changing only a property access. This refactored version requires an
     * addional auxiliary function, but avoids repeating code.
     * See original: https://github.com/dabit3/polygon-ethereum-nextjs-marketplace/blob/main/contracts/Market.sol#L121
     */
    function fetchMarketItemsByAddressProperty(string memory _addressProperty)
        public
        view
        returns (MarketItem[] memory)
    {
        require(
            compareStrings(_addressProperty, "seller") || compareStrings(_addressProperty, "owner"),
            "Parameter must be 'seller' or 'owner'"
        );
        uint256 totalItemsCount = _marketItemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemsCount; i++) {
            // Is it ok to assign this variable for better code legbility?
            // Is it better to use memory or storage in this case?
            MarketItem storage item = marketItemIdToMarketItem[i + 1];
            address addressPropertyValue = getMarketItemAddressByProperty(item, _addressProperty);
            if (addressPropertyValue != msg.sender) continue;
            itemCount += 1;
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint256 i = 0; i < totalItemsCount; i++) {
            // Is it ok to assign this variable for better code legbility?
            // Is it better to use memory or storage in this case?
            MarketItem storage item = marketItemIdToMarketItem[i + 1];
            address addressPropertyValue = getMarketItemAddressByProperty(item, _addressProperty);
            if (addressPropertyValue != msg.sender) continue;
            items[currentIndex] = item;
            currentIndex += 1;
        }

        return items;
    }

    function _authorizeUpgrade(address newImplementation) internal onlyOwner override    {
        
     }
}