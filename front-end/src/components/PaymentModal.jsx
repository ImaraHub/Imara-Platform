import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Loader, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useAddress, useContract, useContractWrite } from "@thirdweb-dev/react";
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import stakeToken from '../utils/stake';
import { initiateMpesaPayment, pollPaymentStatus, stakeContractAddress, userAddress } from '../utils/mpesaOnramp';
import { jsPDF } from 'jspdf';
import { useAuth } from '../AuthContext';
import { addProjectContributor } from '../utils/SupabaseClient';
import { sendStakingConfirmationEmail } from '../utils/emailService';
import { addUserData, updateUser } from '../utils/SupabaseClient';

// Lisk Stake Contract ABI (minimal for stake function)
const STAKE_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "stake",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// USDT Contract ABI (for approval)
const USDT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const USDT_CONTRACT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // Polygon USDT

const PaymentModal = ({ isOpen, onClose, amount, onPaymentComplete, project, userEmail, role, formData }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('usdt');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [mpesaOrderId, setMpesaOrderId] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  
  const address = useAddress();
  const { contract: usdtContract } = useContract(USDT_CONTRACT_ADDRESS, USDT_ABI);
  const { contract: stakeContract } = useContract(stakeContractAddress, STAKE_ABI);
  const { mutateAsync: approveUSDT } = useContractWrite(usdtContract, "approve");
  const { mutateAsync: stake } = useContractWrite(stakeContract, "stake");

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const startPolling = (orderID) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const result = await pollPaymentStatus(orderID, userAddress);
        if (result.success) {
          clearInterval(interval);
          setPollingInterval(null);
          setPaymentStatus('success');
          if (result.status.cryptoTransfer?.hash) {
            setTransactionHash(result.status.cryptoTransfer.hash);
          }
        } else {
          clearInterval(interval);
          setPollingInterval(null);
          setPaymentStatus('error');
          setErrorMessage(result.message);
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(interval);
        setPollingInterval(null);
        setPaymentStatus('error');
        setErrorMessage(error.message);
      }
    }, 2000);

    setPollingInterval(interval);
  };

  const handleLiskStake = async () => {
    try {
      if (!address) {
        throw new Error('Please connect your wallet first');
      }

      // Convert amount to USDT decimals (6 decimals for USDT)
      const amountInDecimals = ethers.utils.parseUnits("1", 6); // 1 USDT

      // Check USDT balance
      const balance = await usdtContract.call("balanceOf", [address]);
      if (balance.lt(amountInDecimals)) {
        throw new Error('Insufficient USDT balance');
      }

      // First approve the stake contract to spend USDT
      const approveTx = await approveUSDT({
        args: [stakeContractAddress, amountInDecimals],
      });
      
      // Wait for approval transaction to be mined
      await approveTx.wait();

      // Now stake the USDT
      const stakeTx = await stake({
        args: [amountInDecimals],
      });

      // Wait for stake transaction to be mined
      const receipt = await stakeTx.wait();
      
      setTransactionHash(receipt.transactionHash);
      setPaymentStatus('success');
      onPaymentComplete({ 
        method: 'usdt', 
        address: address,
        details: {
          hash: receipt.transactionHash,
          amount: "1",
          token: "USDT",
          type: "stake"
        }
      });

    } catch (error) {
      console.error('Stake error:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message || 'Failed to stake USDT');
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    setPaymentStatus('pending');

    try {
      // First update user data in database
      const stakerAddress = paymentMethod === 'usdt' ? address : phoneNumber;
      console.log("Updating user data with staker address:", stakerAddress);
      console.log("Form data being sent:", formData);
      
      if (!formData) {
        throw new Error('Form data is required');
      }

      const result = await addUserData(formData, user, stakerAddress);
      if (result !== true) {
        await updateUser(user, formData, stakerAddress);
      }
      console.log("User data updated successfully");

      if (paymentMethod === 'usdt') {
        await handleLiskStake();
      } else {
        // Handle M-Pesa payment
        if (!phoneNumber || phoneNumber.length < 10) {
          throw new Error('Please enter a valid phone number');
        }
        
        // Initiate M-Pesa payment
        const response = await initiateMpesaPayment(phoneNumber, amount);
        if (response.success) {
          setMpesaOrderId(response.orderID);
          setPaymentStatus('pending_mpesa');
          // Start polling for payment status
          startPolling(response.orderID);
        } else {
          throw new Error(response.message || 'M-Pesa payment failed');
        }
      }
    } catch (error) {
      setPaymentStatus('error');
      // Format error message to be more user-friendly
      if (error.message?.includes('nonce too low') || error.message?.includes('nonce has already been used')) {
        setErrorMessage('Transaction failed: Please try again in a few moments');
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = async () => {
    const paymentData = { 
      method: paymentMethod, 
      phoneNumber,
      orderId: mpesaOrderId,
      details: {
        amount,
        timestamp: new Date().toISOString(),
        transactionHash,
        status: 'success'
      }
    };

    // If we have a project prop, we're in the join group context
    if (project) {
      try {
        // Navigate first to prevent the join group page from showing
        navigate(`/idea/${project.id}`, { 
          state: { 
            project, 
            stakeSuccess: true,
            paymentData,
            isContributor: true
          } 
        });

        // Then handle the async operations
        const result = await onPaymentComplete(paymentData);
        
        if (!result.success) {
          console.error("Error updating user data:", result.error);
          return;
        }

        // Send confirmation email
        console.log("Sending email to:", userEmail);
        const emailSent = await sendStakingConfirmationEmail({
          userEmail,
          project,
          paymentDetails: {
            amount: paymentMethod === 'usdt' ? '1' : amount.toString(),
            token: paymentMethod === 'usdt' ? 'USDT' : 'KES',
            transactionHash: transactionHash || mpesaOrderId,
            timestamp: new Date().toISOString()
          }
        });

        if (!emailSent) {
          console.warn('Failed to send confirmation email');
        }

        // Fetch updated project data
        const updatedProject = await fetchProjectById(project.id);
        console.log("Updated project data:", updatedProject);

        // Update the state with the latest data
        navigate(`/idea/${project.id}`, { 
          state: { 
            project: updatedProject, 
            stakeSuccess: true,
            paymentData,
            isContributor: true,
            userData: result.userData
          } 
        });

      } catch (error) {
        console.error("Error in handleContinue:", error);
        // The user is already on the ViewIdea page, so we just need to show an error message
        navigate(`/idea/${project.id}`, { 
          state: { 
            project, 
            stakeSuccess: true,
            paymentData,
            error: error.message || "Payment successful but failed to update user data. Please contact support."
          } 
        });
      }
    } else {
      // Otherwise, just call the onPaymentComplete callback
      onPaymentComplete(paymentData);
    }
  };

  const downloadReceipt = () => {
    // Create PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Payment Receipt', 105, 20, { align: 'center' });
    
    // Add payment details
    doc.setFontSize(12);
    const details = [
      ['Payment Method:', paymentMethod.toUpperCase()],
      ['Amount:', `KES ${amount.toLocaleString()}`],
      ['Date:', new Date().toLocaleDateString()],
      ['Time:', new Date().toLocaleTimeString()],
      ['Status:', 'Success'],
    ];

    // Add M-Pesa specific details if applicable
    if (paymentMethod === 'mpesa') {
      details.push(['Phone Number:', phoneNumber]);
      details.push(['Order ID:', mpesaOrderId]);
    }

    // Add USDT specific details if applicable
    if (paymentMethod === 'usdt' && transactionHash) {
      details.push(['Transaction Hash:', transactionHash]);
      details.push(['Amount Staked:', '1 USDT']);
    }

    // Add details to PDF
    let y = 40;
    details.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 20, y);
      doc.setFont(undefined, 'normal');
      doc.text(value, 70, y);
      y += 10;
    });

    // Add footer
    doc.setFontSize(10);
    doc.text('Thank you for your payment!', 105, y + 20, { align: 'center' });
    doc.text('This receipt serves as proof of your transaction.', 105, y + 30, { align: 'center' });

    // Save the PDF
    doc.save(`payment-receipt-${new Date().getTime()}.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Complete Payment</h2>
          <p className="text-gray-400">Amount: KES {amount.toLocaleString()}</p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentMethod('usdt')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'usdt'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-400" />
                <span className="text-sm font-medium">USDT</span>
              </div>
            </button>
            <button
              onClick={() => setPaymentMethod('mpesa')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'mpesa'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Smartphone className="w-6 h-6 text-green-400" />
                <span className="text-sm font-medium">M-Pesa</span>
              </div>
            </button>
          </div>
        </div>

        {/* M-Pesa Phone Number Input */}
        {paymentMethod === 'mpesa' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g., 0712345678"
              className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-white"
            />
            <p className="text-sm text-gray-400 mt-2">
              Enter the phone number registered with M-Pesa (format: 0712345678)
            </p>
          </div>
        )}

        {/* Wallet Warning - Only for USDT */}
        {paymentMethod === 'usdt' && !address && (
          <div className="mb-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <p className="text-sm text-yellow-300">
                Please connect your wallet to proceed with USDT staking
              </p>
            </div>
          </div>
        )}

        {/* USDT Payment Info */}
        {paymentMethod === 'usdt' && address && (
          <div className="mb-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <p className="text-sm text-blue-300">
                You will stake 1 USDT in the Lisk contract
              </p>
            </div>
          </div>
        )}

        {/* M-Pesa Payment Instructions */}
        {paymentStatus === 'pending_mpesa' && (
          <div className="mb-6 space-y-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <h3 className="text-sm font-medium text-green-300 mb-2">M-Pesa Payment Instructions</h3>
              <ol className="text-sm text-green-200 space-y-2 list-decimal list-inside">
                <li>An M-Pesa prompt will be sent to <span className="font-medium">{phoneNumber}</span></li>
                <li>Check your phone for the M-Pesa prompt</li>
                <li>Enter your M-Pesa PIN to complete the payment</li>
                <li>Wait for the M-Pesa confirmation message</li>
                <li>We will automatically process your payment once confirmed</li>
              </ol>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-green-300">
                  Order ID: <span className="font-mono">{mpesaOrderId}</span>
                </p>
                <div className="flex items-center gap-2 text-sm text-green-300">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Waiting for payment confirmation...</span>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-sm text-red-300">{errorMessage}</p>
          </div>
        )}

        {/* Payment Status */}
        {paymentStatus === 'pending' && !mpesaOrderId && (
          <div className="mb-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center justify-center gap-2">
              <Loader className="w-5 h-5 animate-spin text-yellow-400" />
              <p className="text-sm text-yellow-300">Processing payment...</p>
            </div>
          </div>
        )}

        {/* Pay Button */}
        {paymentStatus !== 'pending_mpesa' && !pollingInterval && paymentStatus !== 'success' && (
          <button
            onClick={handlePayment}
            disabled={isProcessing || 
              (paymentMethod === 'usdt' && !address) || 
              (paymentMethod === 'mpesa' && !phoneNumber)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : paymentMethod === 'usdt' ? (
              address ? 'Stake USDT' : 'Connect Wallet'
            ) : (
              'Pay with M-Pesa'
            )}
          </button>
        )}

        {/* Success Message and Continue Button */}
        {paymentStatus === 'success' && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Check className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-green-300">Payment Successful!</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white font-medium">KES {amount.toLocaleString()}</span>
                </div>
                
                {mpesaOrderId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">M-Pesa Order ID:</span>
                    <span className="text-white font-mono">{mpesaOrderId}</span>
                  </div>
                )}

                {transactionHash && (
                  <div className="pt-3 border-t border-green-500/20">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Transaction Hash:</span>
                      <a 
                        href={`https:blockscout.lisk.com/tx/${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 font-mono text-xs truncate max-w-[200px]"
                      >
                        {transactionHash}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={downloadReceipt}
                  className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download Receipt (PDF)
                </button>
                
                <button
                  onClick={() => {
                    handleContinue();
                    onClose(); // Close the modal after continuing
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg transition-all hover:opacity-90"
                >
                  Continue to Idea Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal; 