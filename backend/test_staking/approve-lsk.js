// approve-lsk.js
const { ethers } = require("ethers");


const CONTRACT_ADDRESS = '0x3df3ef1ede72c486066af309a9ec794004c0943a';
async function depositUSDTWithPermit() {
    // Setup (replace with your actual values)
    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia-api.lisk.com');
    const CONTRACT_ADDRESS = '0x3df3ef1ede72c486066af309a9ec794004c0943a';
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
