// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./DappsStaking.sol";

contract MarketplaceV1_09 is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
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
        uint256 tvl;
        uint256 numStakers;
    }

    enum StakingStatus {
        Bonded,
        Unbonding,
        Withdrawable,
        Expired
    }

    struct Stake {
        address staker;
        uint256 amount;
        uint256 bondedEra;
        uint256 unbondedEra;
        StakingStatus status;
    }

    uint256 private listingFee;
    DappsStaking public constant DAPPS_STAKING =
        DappsStaking(0x0000000000000000000000000000000000005001);

    CountersUpgradeable.Counter private _numStakers;
    mapping(address => mapping(uint128 => Stake))
        private addressToCollectionIdToStake;

    uint256 latestWithdrawnEra;

    uint256 totalDeposits;

    receive() external payable {}

    function stake(uint128 _collectionId) external payable {
        require(
            addressToCollectionIdToStake[msg.sender][_collectionId].amount <=
                0 ||
                addressToCollectionIdToStake[msg.sender][_collectionId]
                    .status ==
                StakingStatus.Expired
        );
        DAPPS_STAKING.bond_and_stake(address(this), uint128(msg.value));

        addressToCollectionIdToStake[msg.sender][_collectionId] = Stake(
            msg.sender,
            msg.value,
            DAPPS_STAKING.read_current_era(),
            0,
            StakingStatus.Bonded
        );

        collectionIdToCollection[_collectionId].tvl += msg.value;

        collectionIdToCollection[_collectionId].numStakers += 1;
    }

    function unBond(uint128 _collectionId) external {
        require(
            addressToCollectionIdToStake[msg.sender][_collectionId].status ==
                StakingStatus.Bonded
        );
        require(
            addressToCollectionIdToStake[msg.sender][_collectionId].amount > 0
        );
        uint128 amount = uint128(
            addressToCollectionIdToStake[msg.sender][_collectionId].amount
        );
        DAPPS_STAKING.unbond_and_unstake(address(this), amount);
        addressToCollectionIdToStake[msg.sender][_collectionId]
            .unbondedEra = DAPPS_STAKING.read_current_era();
        addressToCollectionIdToStake[msg.sender][_collectionId]
            .status = StakingStatus.Unbonding;
    }

    function requestWithdraw(uint128 _collectionId, address _address) external {
        //check unbondingperiod is over for current staker/amount

        require(
            addressToCollectionIdToStake[_address][_collectionId].status !=
                StakingStatus.Expired
        );

        if (
            addressToCollectionIdToStake[_address][_collectionId].unbondedEra +
                2 <=
            DAPPS_STAKING.read_current_era()
        ) {
            addressToCollectionIdToStake[_address][_collectionId]
                .status = StakingStatus.Withdrawable;
        }

        require(
            addressToCollectionIdToStake[_address][_collectionId].status ==
                StakingStatus.Withdrawable
        );
        require(
            addressToCollectionIdToStake[_address][_collectionId].amount > 0
        );
        require(
            addressToCollectionIdToStake[_address][_collectionId].unbondedEra >
                0
        );

        if (
            addressToCollectionIdToStake[_address][_collectionId].amount >
            address(this).balance
        ) {
            withdrawUnbonded();
        }

        payable(_address).transfer(
            addressToCollectionIdToStake[_address][_collectionId].amount
        );

        addressToCollectionIdToStake[_address][_collectionId]
            .status = StakingStatus.Expired;

        collectionIdToCollection[_collectionId]
            .tvl -= addressToCollectionIdToStake[_address][_collectionId]
            .amount;
        collectionIdToCollection[_collectionId].numStakers -= 1;
    }

    function claim(uint128 _era) external {
        DAPPS_STAKING.claim_staker(address(this));
        DAPPS_STAKING.claim_dapp(address(this), _era);
        latestWithdrawnEra = uint256(_era);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getLatestWithdrawEra() public view returns (uint256) {
        return latestWithdrawnEra;
    }

    function getTotalStaked() public view returns (uint128) {
        return
            DAPPS_STAKING.read_staked_amount(abi.encodePacked(address(this)));
    }

    function withdrawUnbonded() public {
        DAPPS_STAKING.withdraw_unbonded();
    }

    function getStakes(uint128 _collection, address _address)
        public
        view
        returns (Stake memory)
    {
        return addressToCollectionIdToStake[_address][_collection];
    }

    function initialize() public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init();
        listingFee = 0 wei;
        if (latestWithdrawnEra < 1350) latestWithdrawnEra = 1350;
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
                    msg.sender
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
            0,
            0,
            0
        );
        _collectionIds.increment();
        _activeCollections.increment();
    }

    function delistCollection(uint256 _collectionId) public {
        require(_collectionId >= 0 && _collectionId < _collectionIds.current());
        require(collectionIdToCollection[_collectionId].active);
        require(collectionIdToCollection[_collectionId].creator == msg.sender);
        collectionIdToCollection[_collectionId].active = false;
        _activeCollections.decrement();
    }

    function reportCollection(uint256 _collectionId) public {
        Collection memory targetCollection = collectionIdToCollection[
            _collectionId
        ];
        require(
            addressToCollectionToReported[msg.sender][_collectionId] == false
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
        require(price > 0);
        require(msg.value == listingFee);
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

        return marketItemId;
    }

    function cancelMarketItem(address NFTContractAddress, uint256 marketItemId)
        public
        payable
    {
        uint256 tokenId = marketItemIdToMarketItem[marketItemId].tokenId;
        require(tokenId >= 0);

        require(marketItemIdToMarketItem[marketItemId].seller == msg.sender);

        ERC721Upgradeable(NFTContractAddress).transferFrom(
            address(this),
            msg.sender,
            tokenId
        );

        marketItemIdToMarketItem[marketItemId].owner = payable(msg.sender);
        marketItemIdToMarketItem[marketItemId].canceled = true;

        _tokensCanceled.increment();
    }

    function createMarketSale(address NFTContractAddress, uint256 marketItemId)
        public
        payable
    {
        uint256 price = marketItemIdToMarketItem[marketItemId].price;
        uint256 tokenId = marketItemIdToMarketItem[marketItemId].tokenId;
        require(msg.value == price);

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
                compareStrings(property, "owner")
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
                compareStrings(_addressProperty, "owner")
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
