// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Milestone is Ownable, ReentrancyGuard {
    struct Milestone {
        uint256 id;
        string title;
        string description;
        uint256 amount;
        bool isCompleted;
        bool isFunded;
        address[] validators;
        mapping(address => bool) validatorApprovals;
    }

    struct Project {
        uint256 id;
        address owner;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 milestoneCount;
        mapping(uint256 => Milestone) milestones;
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCount;
    IERC20 public paymentToken;

    event ProjectCreated(uint256 indexed projectId, address indexed owner);
    event MilestoneCreated(uint256 indexed projectId, uint256 indexed milestoneId);
    event MilestoneCompleted(uint256 indexed projectId, uint256 indexed milestoneId);
    event FundsReleased(uint256 indexed projectId, uint256 amount);

    constructor(address _paymentToken) {
        paymentToken = IERC20(_paymentToken);
    }

    function createProject(uint256 _totalAmount) external returns (uint256) {
        require(_totalAmount > 0, "Amount must be greater than 0");
        
        uint256 projectId = projectCount++;
        Project storage project = projects[projectId];
        
        project.id = projectId;
        project.owner = msg.sender;
        project.totalAmount = _totalAmount;
        project.releasedAmount = 0;
        project.milestoneCount = 0;

        emit ProjectCreated(projectId, msg.sender);
        return projectId;
    }

    function createMilestone(
        uint256 _projectId,
        string memory _title,
        string memory _description,
        uint256 _amount
    ) external {
        Project storage project = projects[_projectId];
        require(msg.sender == project.owner, "Only project owner can create milestones");
        require(_amount > 0, "Amount must be greater than 0");
        require(project.releasedAmount + _amount <= project.totalAmount, "Exceeds total project amount");

        uint256 milestoneId = project.milestoneCount++;
        Milestone storage milestone = project.milestones[milestoneId];
        
        milestone.id = milestoneId;
        milestone.title = _title;
        milestone.description = _description;
        milestone.amount = _amount;
        milestone.isCompleted = false;
        milestone.isFunded = false;

        emit MilestoneCreated(_projectId, milestoneId);
    }

    function addValidator(uint256 _projectId, uint256 _milestoneId, address _validator) external {
        Project storage project = projects[_projectId];
        require(msg.sender == project.owner, "Only project owner can add validators");
        
        Milestone storage milestone = project.milestones[_milestoneId];
        milestone.validators.push(_validator);
    }

    function approveMilestone(uint256 _projectId, uint256 _milestoneId) external {
        Project storage project = projects[_projectId];
        Milestone storage milestone = project.milestones[_milestoneId];
        
        bool isValidator = false;
        for (uint i = 0; i < milestone.validators.length; i++) {
            if (milestone.validators[i] == msg.sender) {
                isValidator = true;
                break;
            }
        }
        require(isValidator, "Not a validator for this milestone");
        
        milestone.validatorApprovals[msg.sender] = true;
        
        // Check if milestone has enough approvals
        uint256 approvalCount = 0;
        for (uint i = 0; i < milestone.validators.length; i++) {
            if (milestone.validatorApprovals[milestone.validators[i]]) {
                approvalCount++;
            }
        }
        
        if (approvalCount >= milestone.validators.length / 2) {
            milestone.isCompleted = true;
            emit MilestoneCompleted(_projectId, _milestoneId);
        }
    }

    function releaseFunds(uint256 _projectId, uint256 _milestoneId) external nonReentrant {
        Project storage project = projects[_projectId];
        Milestone storage milestone = project.milestones[_milestoneId];
        
        require(milestone.isCompleted, "Milestone not completed");
        require(!milestone.isFunded, "Milestone already funded");
        require(project.releasedAmount + milestone.amount <= project.totalAmount, "Exceeds total project amount");
        
        milestone.isFunded = true;
        project.releasedAmount += milestone.amount;
        
        require(
            paymentToken.transfer(project.owner, milestone.amount),
            "Token transfer failed"
        );
        
        emit FundsReleased(_projectId, milestone.amount);
    }

    function getMilestone(uint256 _projectId, uint256 _milestoneId)
        external
        view
        returns (
            uint256 id,
            string memory title,
            string memory description,
            uint256 amount,
            bool isCompleted,
            bool isFunded
        )
    {
        Project storage project = projects[_projectId];
        Milestone storage milestone = project.milestones[_milestoneId];
        
        return (
            milestone.id,
            milestone.title,
            milestone.description,
            milestone.amount,
            milestone.isCompleted,
            milestone.isFunded
        );
    }

    function getProject(uint256 _projectId)
        external
        view
        returns (
            uint256 id,
            address owner,
            uint256 totalAmount,
            uint256 releasedAmount,
            uint256 milestoneCount
        )
    {
        Project storage project = projects[_projectId];
        
        return (
            project.id,
            project.owner,
            project.totalAmount,
            project.releasedAmount,
            project.milestoneCount
        );
    }
} 