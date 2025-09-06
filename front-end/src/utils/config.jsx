import {ethers}  from "ethers";

// import { useAddress } from '@thirdweb-dev/react';


export const contractAddress = "0x7E81E4697863cAB4FE4C0d820baCbc9e9843e3dD";

async function createToken({name, symbol, initialSupply, logUrl, address}) {
    // Initialize ethers.js provider (e.g., using MetaMask's provider)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    console.log("Creating token with the following parameters:", { name, symbol, initialSupply, logUrl });
    // print signer address
    console.log("Signer address:", await signer.getAddress());

    // Initialize contract
    const tokenFactory = new ethers.Contract(contractAddress, TokenFactoryABI.abi, signer);

    try {
        const tx = await tokenFactory.createToken(name, symbol, initialSupply, logUrl);
    
        const receipt = await tx.wait();  // Wait for transaction to be mined
        // EXtract token address from emitted event
        const event = receipt.events?.find(e => e.event === "TokenCreated" || e.event === null);

        if (!event) {
            console.error("TokenCreated event not found in transaction receipt");
        }
        const tokenAddress = event.args[1];

        console.log("Token address:", tokenAddress);

        return tokenAddress;
    } catch (error) {
        console.error("Error creating token:", error);
    }
}



export default createToken;
