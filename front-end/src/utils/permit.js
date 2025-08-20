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
  try {
    // Minimal ABI for permit
    const ERC20PermitABI = [
      "function nonces(address) view returns (uint256)",
      "function name() view returns (string)",
      "function DOMAIN_SEPARATOR() view returns (bytes32)",
      "function balanceOf(address) view returns (uint256)",
      "function allowance(address, address) view returns (uint256)"
    ];

    const token = new ethers.Contract(tokenAddress, ERC20PermitABI, signer);

    const balance = await token.balanceOf(owner);
    console.log(`🪙 Wallet balance: ${balance} USDC`);
    console.log(`🛠  Attempting to permit ${value} USDC from ${owner}`);
    console.log("valueeeeeeeee", value, typeof value);

    if (balance.lt(value)) {
      const errMessage = "❌ Insufficient balance: can't approve more than owned.";
      console.error(errMessage);
      return { error: errMessage };
    }

 
    // Get nonce
    const nonce = await token.nonces(owner);

    // Get token name
    let name = "USDC";
    try {
      name = await token.name();
    } catch {
      console.warn("⚠️ token.name() failed, using fallback 'USDC'");
    }

    // Domain
    const domain = {
      name,
      version: "1",
      chainId,
      verifyingContract: tokenAddress
    };
console.log("value", value, typeof value);
    // Types
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

    // Sign the message
    const signature = await signer._signTypedData(domain, types, message);
    const { v, r, s } = ethers.utils.splitSignature(signature);

    return { v, r, s, nonce, deadline };

  } catch (error) {
    console.error("❌ generatePermitSignature error:", error);
    return {
      error: error.message || "Unknown error during permit signature generation."
    };
  }
}