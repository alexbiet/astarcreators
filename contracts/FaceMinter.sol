// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract FaceMinter is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("FaceMinter", "FACE") {}

    function _baseURI() internal pure override returns (string memory) {
        return "https://bafybeibcoepngugidjcroor2lnxc62sxkizozk3uimvoqk4hksok4ncx4i.ipfs.nftstorage.link/face-";
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        uint randomNum = (random() % 6) + 1;
        string memory randomUri = string.concat(_baseURI(), Strings.toString(randomNum));
        randomUri = string.concat(randomUri, ".png");
        _setTokenURI(tokenId, randomUri);
    }

   function random() private view returns(uint256){
    return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp)));
}

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}