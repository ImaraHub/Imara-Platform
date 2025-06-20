import { ethers } from "ethers";

/**
 * Generates an EIP-2612 permit signature for a token supporting permit (e.g., USDT, USDC).
 *
 * @param {Object} params
 * @param {string} params.tokenAddress - The ERC20 token address
 * @param {string} params.owner - The address of the token owner (signer)
 * @param {string} params.spender - The address allowed to spend the tokens
 * @param {string|number|BigInt} params.value - The amount to permit
 * @param {number} params.deadline - The unix timestamp deadline for the permit
 * @param {object} params.provider - ethers.js provider
 * @param {object} params.signer - ethers.js signer (wallet)
 * @param {number} params.chainId - Chain ID
 * @returns {Promise<{v: number, r: string, s: string}>}
 */
export async function generatePermitSignature({
  tokenAddress,
  owner,
  spender,
  value,
  deadline,
  signer,
  chainId
}) {
  // Minimal ABI for permit
  const ERC20PermitABI = [
    "function nonces(address) view returns (uint256)",
    "function name() view returns (string)",
    "function DOMAIN_SEPARATOR() view returns (bytes32)",
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address, address) view returns (uint256)',
    'function nonces(address) view returns (uint256)',
  ];


  const balance = await token.balanceOf(wallet.address);
  console.log(`🪙 Wallet balance: ${ethers.formatUnits(balance, 18)} LSK`);
  console.log(`🛠  Attempting to permit: ${ethers.formatUnits(AMOUNT, 18)} LSK`);
  
  if (balance.lt(AMOUNT)) {
    console.error("❌ Insufficient balance: can't approve more than owned.");
    process.exit(1); // Exit early
  }

  const token = new ethers.Contract(tokenAddress, ERC20PermitABI, signer);

  // Get nonce
  const nonce = await token.nonces(owner);

  // Get token name
  let name = "LSK";
  try {
    name = await token.name();
  } catch (e) {
    console.warn("Token name() failed, using fallback 'LSK'");
  }

  // EIP-2612 domain
  const domain = {
    name,
    version: "1",
    chainId,
    verifyingContract: tokenAddress
  };

  // EIP-2612 types
  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ]
  };

  const message = {
    owner,
    spender,
    value: value.toString(),
    nonce: nonce.toString(),
    deadline: deadline.toString()
  };

  // Sign the permit
  const signature = await signer._signTypedData(domain, types, message);
  const { v, r, s } = ethers.utils.splitSignature(signature);
  return { v, r, s , nonce, deadline};
} 
