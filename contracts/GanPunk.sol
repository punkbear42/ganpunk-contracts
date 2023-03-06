// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

// import "hardhat/console.sol";

contract GanPunk is Initializable, ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {    
    // IQuoter public constant quoter = IQuoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);
    address private constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address private constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    struct data {
        bytes model;
        bytes latentSpace;
    }

    mapping (bytes32 => bool) public latentSpaceHashes; // hash of the latent space => token_id
    mapping (uint256 => data) public datas; // token_id => {model, latentSpace}
    mapping (bytes => address) public modelOwner; // model_ipfs_hash => owner
    uint creationCostInDai;
    uint modelOwnerPercent;
    uint safePercent;
    address payable safe;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __ERC721_init("GanPunk", "GPunk");
        __Ownable_init();
        __UUPSUpgradeable_init();
        creationCostInDai = 50;
        modelOwnerPercent = 60;
        safePercent = 40;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    function setSafe(address payable _safe) public onlyOwner {
        safe = _safe;
    }

    function setModelOwnerPercent(uint percent) public onlyOwner  {
        modelOwnerPercent = percent;
    }

    function setSafePercent(uint percent) public onlyOwner  {
        safePercent = percent;
    }

    function setModel(bytes calldata _model) public {
        require(modelOwner[_model] == address(0), "model shouldn't be already set");
        modelOwner[_model] = msg.sender;
    }

    function mint(bytes memory _model, bytes memory _input, address _to, uint256 tokenId) public payable {
        bytes32 latentSpaceHash = keccak256(abi.encode(_model, _input));        
        require(latentSpaceHashes[latentSpaceHash] == false, "latent space already used");
        if (safe != address(0)) {
            require(msg.value != 0, "value is set to 0");
            safe.transfer(msg.value * safePercent / 100);
        }
        if (modelOwner[_model] != address(0)) {
            require(msg.value != 0, "value is set to 0");
            payable(modelOwner[_model]).transfer(msg.value * modelOwnerPercent / 100);
        }

        datas[tokenId] = data(_model, _input);
        latentSpaceHashes[latentSpaceHash] = true;

        _safeMint(_to, tokenId);        
    }

    function dataOf(uint tokenId) public view returns (data memory) {
        require(_exists(tokenId), "token does not exist");
        return datas[tokenId];
    }

    function getEstimatedETHforDAI(uint daiAmount) public returns (uint256) {
        address tokenIn = DAI;
        address tokenOut = WETH9;
        uint24 fee = 500;
        uint160 sqrtPriceLimitX96 = 0;

        return 34;
        // return quoter.quoteExactInputSingle(
        //     tokenIn,
        //     tokenOut,
        //     fee,
        //     daiAmount,
        //     sqrtPriceLimitX96
        // );
    }
}
