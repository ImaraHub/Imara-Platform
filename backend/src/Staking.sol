// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Staking {
    uint256 public constant STAKE_AMOUNT =  0.0003 ether; // Fixed stake amount (0 ETH for testing)
    uint256 public constant ESTIMATED_APR = 1867; // 18.67% APR (scaled by 100 for precision)
    address public owner;

    struct Staker {
        uint256 amountStaked;
        uint256 totalRewardsClaimed;
        uint256 unclaimedRewards;
        uint256 stakingTimestamp;
    }

    mapping(address => Staker) public stakers;
    uint256 public totalStakedAmount;

    event Staked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function stake() external payable {
        require(msg.value == STAKE_AMOUNT, "Incorrect staking amount");
        require(stakers[msg.sender].amountStaked == 0, "Already staked");

        stakers[msg.sender] = Staker({
            amountStaked: msg.value,
            totalRewardsClaimed: 0,
            unclaimedRewards: 0,
            stakingTimestamp: block.timestamp
        });

        totalStakedAmount += msg.value;
        emit Staked(msg.sender, msg.value);
    }

    function getStakedAmount(address _user) external view returns (uint256) {
        return stakers[_user].amountStaked;
    }

    function getAvailableBalance(address /*_user*/)
        external
        pure
        returns (uint256)
    {
        return 0; // Placeholder, as cross-chain balance checking isn't implemented
    }

    function getTotalStakedAmount() external view returns (uint256) {
        return totalStakedAmount;
    }

    function getTotalRewardsClaimed(address _user)
        external
        view
        returns (uint256)
    {
        return stakers[_user].totalRewardsClaimed;
    }

    function getEstimatedAPR() external pure returns (uint256) {
        return ESTIMATED_APR;
    }

    function getEstimatedDailyRewards(address _user)
        external
        view
        returns (uint256)
    {
        return (stakers[_user].amountStaked * ESTIMATED_APR) / (365 * 10000);
    }

    function getUnclaimedRewards(address _user)
        external
        view
        returns (uint256)
    {
        return stakers[_user].unclaimedRewards;
    }
}
