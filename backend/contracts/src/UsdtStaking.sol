// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MinimalPermitDeposit
 * @dev Minimal contract for permit-based ERC20 deposits (USDT, USDC, etc.)
 */
contract MinimalPermitDeposit is ReentrancyGuard {
    
    // Events
    event TokenDeposited(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 indexed depositId
    );
    
    // State variables
    uint256 public nextDepositId;
    
    // Deposit tracking
    struct Deposit {
        address user;
        address token;
        uint256 amount;
        uint256 timestamp;
    }
    
    mapping(uint256 => Deposit) public deposits;
    mapping(address => uint256[]) public userDeposits;
    
    /**
     * @dev Deposit ERC20 tokens using permit (gasless approval)
     * @param token The ERC20 token address
     * @param amount Amount to deposit
     * @param deadline Permit deadline
     * @param v Permit signature v
     * @param r Permit signature r  
     * @param s Permit signature s
     * @return depositId Unique identifier for this deposit
     */
    function depositWithPermit(
        address token,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant returns (uint256 depositId) {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");
        
        // Execute permit for gasless approval
        IERC20Permit(token).permit(
            msg.sender,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        );
        
        // Transfer tokens from user to contract
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        // Record deposit
        depositId = nextDepositId++;
        deposits[depositId] = Deposit({
            user: msg.sender,
            token: token,
            amount: amount,
            timestamp: block.timestamp
        });
        
        // Track user deposits
        userDeposits[msg.sender].push(depositId);
        
        emit TokenDeposited(msg.sender, token, amount, depositId);
    }
    
    /**
     * @dev Get deposit information
     */
    function getDeposit(uint256 depositId) 
        external 
        view 
        returns (
            address user,
            address token,
            uint256 amount,
            uint256 timestamp
        )
    {
        Deposit memory deposit = deposits[depositId];
        return (deposit.user, deposit.token, deposit.amount, deposit.timestamp);
    }
    
    /**
     * @dev Get all deposit IDs for a user
     */
    function getUserDeposits(address user) external view returns (uint256[] memory) {
        return userDeposits[user];
    }
    
    /**
     * @dev Get contract balance for a specific token
     */
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    
    /**
     * @dev Get total number of deposits
     */
    function getTotalDeposits() external view returns (uint256) {
        return nextDepositId;
    }
}