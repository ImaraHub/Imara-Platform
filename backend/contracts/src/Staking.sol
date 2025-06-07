// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}
contract Staking {
    address public immutable owner;
    address public immutable lskToken;
    enum TokenType { ETH, LSK }
    mapping(address => bool) public approvedUnstake;
    event Staked(address indexed user, uint256 amount, TokenType tokenType);
    event UnstakeRequested(address indexed user, TokenType tokenType);
    event Unstaked(address indexed user, uint256 amount, TokenType tokenType);
    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }
    constructor(address _lskTokenAddress) {
        owner = msg.sender;
        lskToken = _lskTokenAddress;
    }
    // 1. Stake ETH
    function stakeWithEth() external payable {
        require(msg.value > 0, "Amount must be > 0");
        emit Staked(msg.sender, msg.value, TokenType.ETH);
    }
    // 2. Direct ETH deposit
    receive() external payable {
        require(msg.value > 0, "Amount must be > 0");
        emit Staked(msg.sender, msg.value, TokenType.ETH);
    }
    // 3. Stake LSK
    function stakeWithLsk(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(
            IERC20(lskToken).transferFrom(msg.sender, address(this), amount),
            "LSK transfer failed"
        );
        emit Staked(msg.sender, amount, TokenType.LSK);
    }
    // 4. Register off-chain LSK transfer
    function registerStake(uint256 amount) external {
        emit Staked(msg.sender, amount, TokenType.LSK);
    }
    // 5. User requests unstake
    function requestUnstake(TokenType tokenType) external {
        emit UnstakeRequested(msg.sender, tokenType);
    }
    // 6. Owner approves unstake
    function approveUnstake(address user) external onlyOwner {
        approvedUnstake[user] = true;
    }
    // 7. Unstake
    function unstake(uint256 amount, TokenType tokenType) external {
        require(approvedUnstake[msg.sender], "Not approved");
        require(amount > 0, "Amount must be > 0");
        approvedUnstake[msg.sender] = false;
        if (tokenType == TokenType.ETH) {
            require(address(this).balance >= amount, "Insufficient ETH");
            payable(msg.sender).transfer(amount);
        } else if (tokenType == TokenType.LSK) {
            require(IERC20(lskToken).transfer(msg.sender, amount), "LSK transfer failed");
        }
        emit Unstaked(msg.sender, amount, tokenType);
    }
    // 8. Withdrawals by owner
    function withdrawEth(uint256 amount) external onlyOwner {
        payable(owner).transfer(amount);
    }
    function withdrawLsk(uint256 amount) external onlyOwner {
        IERC20(lskToken).transfer(owner, amount);
    }
}