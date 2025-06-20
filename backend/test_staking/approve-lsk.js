// approve-lsk.js
const { ethers } = require("ethers");

/**
 * Generate permit signature for ERC20 tokens with permit functionality
 * @param {object} params - Permit parameters
 * @param {string} params.tokenAddress - ERC20 token contract address
 * @param {string} params.ownerAddress - Token owner address
 * @param {string} params.spenderAddress - Spender address (contract)
 * @param {string} params.amount - Amount to approve (in wei/smallest unit)
 * @param {number} params.deadline - Unix timestamp deadline
 * @param {object} params.signer - Ethers signer object
 * @param {number} params.chainId - Chain ID (1 for mainnet, 5 for goerli, etc.)
 * @returns {object} Signature components {v, r, s}
 */
async function generatePermitSignature({
    tokenAddress,
    ownerAddress,
    spenderAddress,
    amount,
    deadline,
    signer,
    chainId
}) {
    // ERC20 token contract instance
    const tokenContract = new ethers.Contract(
        tokenAddress,
        [
            'function name() view returns (string)',
            'function nonces(address) view returns (uint256)',
            'function DOMAIN_SEPARATOR() view returns (bytes32)'
        ],
        signer
    );
    
    // Get token name and current nonce
    const [name, nonce] = await Promise.all([
        tokenContract.name(),
        tokenContract.nonces(ownerAddress)
    ]);
    
    // EIP-712 domain
    const domain = {
        name: name,
        version: '1',
        chainId: chainId,
        verifyingContract: tokenAddress
    };
    
    // EIP-712 types
    const types = {
        Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' }
        ]
    };
    
    // Permit message
    const message = {
        owner: ownerAddress,
        spender: spenderAddress,
        value: amount,
        nonce: nonce,
        deadline: deadline
    };
    
    // Generate signature
    const signature = await signer.signTypedData(domain, types, message);
    
    // Split signature into components
    const { v, r, s } = ethers.Signature.from(signature);

    console.log('v:', v);
    console.log('r:', r);

    console.log('s:', s);
    
    return { v, r, s, nonce, deadline };
}

/**
 * Example usage for depositing USDT with permit
 */
async function depositUSDTWithPermit() {
    // Setup (replace with your actual values)
    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia-api.lisk.com');
    const wallet = new ethers.Wallet("", provider);
    
    const USDT_ADDRESS = '0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D'; // Testnet USDT
    const CONTRACT_ADDRESS = '0x3DF3EF1eDE72C486066aF309a9eC794004C0943A';
    const AMOUNT = ethers.parseUnits('0.1', 18); // LSK (18 decimals)
    const DEADLINE = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    
    try {
        // Generate permit signature
        const signature = await generatePermitSignature({
            tokenAddress: USDT_ADDRESS,
            ownerAddress: wallet.address,
            spenderAddress: CONTRACT_ADDRESS,
            amount: AMOUNT.toString(),
            deadline: DEADLINE,
            signer: wallet,
            chainId: 4202 // testnet
        });
        
        // Contract instance
        const depositContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            [
                'function depositWithPermit(address token, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) returns (uint256)'
            ],
            wallet
        );
        
        // Execute deposit with permit
        const tx = await depositContract.depositWithPermit(
            USDT_ADDRESS,
            AMOUNT,
            DEADLINE,
            signature.v,
            signature.r,
            signature.s
        );
        
        console.log('Transaction hash:', tx.hash);
        const receipt = await tx.wait();
        console.log('Deposit successful! Gas used:', receipt.gasUsed.toString());
        
        // Get deposit ID from event logs
        const depositEvent = receipt.logs.find(log => 
            log.topics[0] === ethers.id('TokenDeposited(address,address,uint256,uint256)')
        );
        
        if (depositEvent) {
            const depositId = ethers.AbiCoder.defaultAbiCoder().decode(
                ['uint256'], 
                depositEvent.topics[3]
            )[0];
            console.log('Deposit ID:', depositId.toString());
        }
        
    } catch (error) {
        console.error('Deposit failed:', error);
    }
}

module.exports = {
    generatePermitSignature,
    depositUSDTWithPermit
}; 

depositUSDTWithPermit();
