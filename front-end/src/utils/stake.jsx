import {ethers}  from "ethers";
import stakeFactoryABI from "./stakeAbi.json";
export const stakeContractAddress = "0x65225a4E25977A00E766dF66269774e5f24b2d55"

async function stakeToken() { 
    // Initialize ethers.js provider (e.g., using MetaMask's provider)
    if (!window.ethereum) {
        console.error("MetaMask is not installed");
        return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Request account access if needed
    await provider.send("eth_requestAccounts", []);

    const signer = provider.getSigner();

    console.log("Staking token with the following parameters:");
    // print signer address
    // console.log("Signer address:", await signer.getAddress());

    // Initialize contract
    const stakeFactory = new ethers.Contract(stakeContractAddress, stakeFactoryABI.abi, signer);

    try {
        const tx = await stakeFactory.stake({
            value: ethers.utils.parseEther("0.0003"), // Correctly converts ETH to Wei
            gasLimit: 500000 // Set manual gas limit
        }); 
        const receipt = await tx.wait();  // Wait for transaction to be mined
        // EXtract token address from emitted event
        // const event = receipt.events?.find(e => e.event === "Staked" || e.event === null);

        // if (!event) {
        //     console.error("TokenStaked event not found in transaction receipt");
        // }
        // const tokenAddress = event.args[1];

        // console.log("Token address:", tokenAddress);

        // return tokenAddress;
    } catch (error) {
        console.error("Error staking token:", error);
    }

}
export default stakeToken;