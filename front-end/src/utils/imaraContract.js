import { ethers } from "ethers";
import imaraJson from "./imara.json" assert { type: "json" };

// Configuration
const CONFIG = {
  RPC_URL: "https://base-sepolia.drpc.org",
  PROJECT_CONTRACT_ADDRESS: "0x91e8b1f42e0a48e5e6359c0f589c84f661a312dc",
  TOKEN_ADDRESS: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
  CHAIN_ID: 84532,
};

// Normalize any project identifier (number, hex, UUID) into a uint256 hex string
function resolveProjectId(input) {
  if (input == null) return null;
  // If it's already a BigNumber or number, return as hex string
  if (ethers.BigNumber.isBigNumber(input)) return input.toHexString();
  if (typeof input === 'number') return ethers.BigNumber.from(input).toHexString();

  const raw = String(input);
  const isDecimal = /^\d+$/.test(raw);
  const isHex = /^0x[0-9a-fA-F]+$/.test(raw);
  if (isHex) return raw;
  if (isDecimal) return ethers.BigNumber.from(raw).toHexString();
  // Fallback: treat as UUID/arbitrary string → keccak256(utf8) uint256
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(raw));
}

class ImaraContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.projectContract = null;
    this.tokenContract = null;
    this.isConnected = false;
  }

  async connect() {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    await this.provider.send("eth_requestAccounts", []);
    this.signer = this.provider.getSigner();
    
    const network = await this.provider.getNetwork();
    if (network.chainId !== CONFIG.CHAIN_ID) {
      throw new Error(`Please switch to the correct network (Chain ID: ${CONFIG.CHAIN_ID})`);
    }

    this.projectContract = new ethers.Contract(
      CONFIG.PROJECT_CONTRACT_ADDRESS,
      imaraJson.abi ?? imaraJson.output?.abi,
      this.signer
    );

    const tokenABI = [
      "function name() view returns (string)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function nonces(address) view returns (uint256)",
    ];

    this.tokenContract = new ethers.Contract(
      CONFIG.TOKEN_ADDRESS,
      tokenABI,
      this.signer
    );

    this.isConnected = true;
    return await this.signer.getAddress();
  }

  async createProjectWithDatabaseId(dbProjectId, humanAmount) {
    if (!this.isConnected) throw new Error("Not connected");
    
    const decimals = await this.tokenContract.decimals();
    const stakeAmount = ethers.utils.parseUnits(humanAmount, decimals);
    const address = await this.signer.getAddress();
    const projectId = resolveProjectId(dbProjectId);
    
    // Check if project exists
    const project = await this.projectContract.projects(projectId);
    if (project.creator !== ethers.constants.AddressZero) {
      throw new Error(`Project ${projectId} already exists`);
    }
    
    // Check balance
    const balance = await this.tokenContract.balanceOf(address);
    if (balance.lt(stakeAmount)) {
      throw new Error(`Insufficient balance. Have ${ethers.utils.formatUnits(balance, decimals)}, need ${humanAmount}`);
    }

    // Use approve + createProjectWithId (simpler than permit)
    const approveTx = await this.tokenContract.approve(CONFIG.PROJECT_CONTRACT_ADDRESS, stakeAmount);
    await approveTx.wait();
    
    const tx = await this.projectContract.createProjectWithId(projectId, stakeAmount, { gasLimit: 400000 });
    const receipt = await tx.wait();
    
    return { tx, receipt };
  }

  async setProjectManager(projectId, pmAddress) {
    if (!this.isConnected) throw new Error("Not connected");
    const id = resolveProjectId(projectId);
    const tx = await this.projectContract.setProjectManager(id, pmAddress, { gasLimit: 200000 });
    const receipt = await tx.wait();
    return { tx, receipt };
  }

  async setMilestones(projectId, milestoneIds, budgets, recipients, percentages) {
    if (!this.isConnected) throw new Error("Not connected");
    const id = resolveProjectId(projectId);
    const tx = await this.projectContract.setMilestones(
      id, milestoneIds, budgets, recipients, percentages, { gasLimit: 600000 }
    );
    const receipt = await tx.wait();
    return { tx, receipt };
  }

  async completeMilestone(projectId, milestoneId) {
    if (!this.isConnected) throw new Error("Not connected");
    const id = resolveProjectId(projectId);
    const tx = await this.projectContract.completeMilestone(id, milestoneId, { gasLimit: 400000 });
    const receipt = await tx.wait();
    return { tx, receipt };
  }

  async addFunds(projectId, humanAmount) {
    if (!this.isConnected) throw new Error("Not connected");
    
    const decimals = await this.tokenContract.decimals();
    const amount = ethers.utils.parseUnits(humanAmount, decimals);
    const address = await this.signer.getAddress();
    const id = resolveProjectId(projectId);
    
    const balance = await this.tokenContract.balanceOf(address);
    if (balance.lt(amount)) {
      throw new Error(`Insufficient balance. Have ${ethers.utils.formatUnits(balance, decimals)}, need ${humanAmount}`);
    }

    const approveTx = await this.tokenContract.approve(CONFIG.PROJECT_CONTRACT_ADDRESS, amount);
    await approveTx.wait();
    
    const tx = await this.projectContract.addFunds(id, amount, { gasLimit: 300000 });
    const receipt = await tx.wait();
    
    return { tx, receipt };
  }

  // Read operations
  async getProject(projectId) {
    if (!this.isConnected) throw new Error("Not connected");
    const id = resolveProjectId(projectId);
    return await this.projectContract.getProject(id);
  }

  async getMilestone(projectId, milestoneId) {
    if (!this.isConnected) throw new Error("Not connected");
    const id = resolveProjectId(projectId);
    return await this.projectContract.getMilestone(id, milestoneId);
  }

  async getNextProjectId() {
    if (!this.isConnected) throw new Error("Not connected");
    return await this.projectContract.nextProjectId();
  }

  async getTokenBalance(address = null) {
    if (!this.isConnected) throw new Error("Not connected");
    const targetAddress = address || await this.signer.getAddress();
    return await this.tokenContract.balanceOf(targetAddress);
  }

  // Parse ProjectCreated event
  parseProjectCreatedEvent(receipt) {
    try {
      for (const log of receipt.logs || []) {
        if (log.address?.toLowerCase() !== CONFIG.PROJECT_CONTRACT_ADDRESS.toLowerCase()) continue;
        try {
          const parsed = this.projectContract.interface.parseLog(log);
          if (parsed && parsed.name === 'ProjectCreated' && parsed.args?.projectId != null) {
            return parsed.args.projectId.toString();
          }
        } catch (_) {
          // not this event, continue
        }
      }
    } catch (_) {
      // ignore parsing issues
    }
    return null;
  }
}

const imaraContractService = new ImaraContractService();
export default imaraContractService;
