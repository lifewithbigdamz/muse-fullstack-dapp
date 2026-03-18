// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/royalties/ERC2981.sol";

contract MuseNFT is ERC721URIStorage, Ownable, ReentrancyGuard, ERC2981 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct Artwork {
        string prompt;
        string aiModel;
        uint256 createdAt;
        address creator;
        uint256 royaltyBps; // Basis points (1/100 of a percent)
    }

    mapping(uint256 => Artwork) public artworks;
    mapping(address => uint256) public creatorEarnings;

    uint256 public constant MAX_ROYALTY_BPS = 1000; // 10% max royalty
    uint256 public mintFee = 0.01 ether;

    event ArtworkMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string prompt,
        string aiModel,
        uint256 royaltyBps
    );

    event MintFeeUpdated(uint256 newFee);

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {
        _setDefaultRoyalty(initialOwner, 250); // 2.5% default royalty
    }

    function mintArtwork(
        address to,
        string memory tokenURI,
        string memory prompt,
        string memory aiModel,
        uint256 royaltyBps
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= mintFee, "Insufficient mint fee");
        require(royaltyBps <= MAX_ROYALTY_BPS, "Royalty too high");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        artworks[tokenId] = Artwork({
            prompt: prompt,
            aiModel: aiModel,
            createdAt: block.timestamp,
            creator: to,
            royaltyBps: royaltyBps
        });

        if (royaltyBps > 0) {
            _setTokenRoyalty(tokenId, to, royaltyBps);
        }

        emit ArtworkMinted(tokenId, to, prompt, aiModel, royaltyBps);

        return tokenId;
    }

    function setMintFee(uint256 newFee) external onlyOwner {
        mintFee = newFee;
        emit MintFeeUpdated(newFee);
    }

    function withdrawFees() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    function creatorWithdraw() external {
        uint256 earnings = creatorEarnings[msg.sender];
        require(earnings > 0, "No earnings to withdraw");
        
        creatorEarnings[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: earnings}("");
        require(success, "Withdrawal failed");
    }

    function getArtwork(uint256 tokenId) external view returns (Artwork memory) {
        require(_exists(tokenId), "Token does not exist");
        return artworks[tokenId];
    }

    function getCreatorArtworks(address creator) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= _tokenIdCounter.current(); i++) {
            if (_exists(i) && artworks[i].creator == creator) {
                count++;
            }
        }

        uint256[] memory tokenIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= _tokenIdCounter.current(); i++) {
            if (_exists(i) && artworks[i].creator == creator) {
                tokenIds[index] = i;
                index++;
            }
        }

        return tokenIds;
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
