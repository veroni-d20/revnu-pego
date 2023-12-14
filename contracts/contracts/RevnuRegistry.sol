// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Import OpenZeppelin ERC20 and Ownable for token and contract ownership management
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./RevnuToken.sol";

// Hardhat console.log() for debugging
// import "hardhat/console.sol";

contract RevnuRegistry{
    using Counters for Counters.Counter;

    RevnuToken public revnuToken;

    Counters.Counter public _bountiesCounter; 

    constructor(address revnuTokenAddress){
        revnuToken = RevnuToken(revnuTokenAddress);
    }

    // Struct to represent a Engagement Request entry
    struct Bounty{
        uint256 bountyId;
        address bountyCreator;
        string actionId;        // videoId, channelId, id, etc
        string actionType;      // like, sub, comment, etc
        uint actionCount;    // no. of likes or subscribers 
        uint noOfClaims;   // no. of likes or subscribers completed
        uint256 reward;         // total amt (no.of likes * amt quoted)
    }

    // Struct to represent details of completed requests
    struct Claim{ 
        uint256 bountyId;
        address claimer;
        bytes32 claimHash;
    }

    mapping(uint256 => Bounty) public bountyRegistry;
    mapping(bytes32 => Claim) public claimRegistry;
    mapping(address => uint256) public claimEarnings;

    event BountyClaimed(uint256 bountyId, address claimer, bytes32 claimHash, uint256 claimReward);
    event BountyAdded(uint256 bountyId, address bountyCreator, string actionId, string actionType, uint actionCount, uint noOfClaims, uint256 reward);

    function createBounty(string memory _actionId, string memory _actionType, uint _actionCount, uint256 _reward) public payable{
        // check balance 
        require(revnuToken.balanceOf(msg.sender) >= _reward, "Insufficient Tokens");
        require(_actionCount != 0, "ActionCount cannot be zero");


        _bountiesCounter.increment();
        uint256 _bountyId = _bountiesCounter.current();
        bountyRegistry[_bountyId] = Bounty(_bountyId, msg.sender, _actionId, _actionType, _actionCount, 0, _reward);

        emit BountyAdded(_bountyId, msg.sender, _actionId, _actionType, _actionCount, 0, _reward);
        
        // Deposit reward tokens to contract
        revnuToken.transferFrom(msg.sender, address(this), _reward);
    }

    function claimBounty(uint256 _bountyId) public payable{
        // Check if bounty exists
        require(bountyRegistry[_bountyId].bountyId == _bountyId, "Bounty does not exist.");

        // Check if bounty is claimed
        require(bountyRegistry[_bountyId].noOfClaims < bountyRegistry[_bountyId].actionCount, "Bounty completed.");


        // Generate claimHash using bountyId and msg.sender
        bytes32 _claimHash = keccak256(abi.encodePacked(_bountyId, msg.sender));

        // Check if claimHash already exists
        require(claimRegistry[_claimHash].claimHash != _claimHash, "Bounty already claimed by user."); 

        claimRegistry[_claimHash] = Claim(_bountyId, msg.sender, _claimHash);
        uint256 _claimReward = bountyRegistry[_bountyId].reward / bountyRegistry[_bountyId].actionCount; 

        // Increment Bounty noOfClaims
        bountyRegistry[_bountyId].noOfClaims += 1;

        // Increment user earning balance
        claimEarnings[msg.sender] += _claimReward;

        emit BountyClaimed(_bountyId, msg.sender, _claimHash, _claimReward); 
       
        // Transfer amt
        revnuToken.transfer(msg.sender, _claimReward);
    }

    function getLatestBountyId() public view returns(uint256){
        return _bountiesCounter.current();
    }
}
