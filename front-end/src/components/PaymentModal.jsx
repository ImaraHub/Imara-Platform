import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Loader, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useAddress, useContract, useContractWrite } from "@thirdweb-dev/react";
import { ethers } from 'ethers';
import stakeToken from '../utils/stake';
import { initiateMpesaPayment, pollPaymentStatus, stakeContractAddress, userAddress } from '../utils/mpesaOnramp';

// Lisk Stake Contract ABI (minimal for stake function)
const STAKE_ABI = [
  "function stake(uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)"
];

// USDT Contract ABI (for approval)
const USDT_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const USDT_CONTRACT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // Polygon USDT

const PaymentModal = ({ isOpen, onClose, amount, onPaymentComplete }) => {
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
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Start new polling
    const interval = setInterval(async () => {
      try {
        const result = await pollPaymentStatus(orderID, userAddress);
        if (result.success) {
          // Payment successful
          clearInterval(interval);
          setPollingInterval(null);
          setPaymentStatus('success');
          if (result.status.cryptoTransfer?.hash) {
            setTransactionHash(result.status.cryptoTransfer.hash);
          }
          onPaymentComplete({ 
            method: 'mpesa', 
            phoneNumber,
            orderId: orderID,
            details: {
              ...result.status.details,
              cryptoTransfer: result.status.cryptoTransfer ? {
                status: result.status.cryptoTransfer.status,
                message: result.status.cryptoTransfer.message,
                hash: result.status.cryptoTransfer.hash,
                createdAt: result.status.cryptoTransfer.createdAt,
                updatedAt: result.status.cryptoTransfer.updatedAt
              } : null
            }
          });
        } else {
          // Payment failed
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
    }, 2000); // Poll every 2 seconds

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
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
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

        {paymentStatus === 'success' && (
          <div className="mb-6 space-y-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Check className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-green-300">Congratulations! Staking Successful</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white font-medium">KES {amount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">M-Pesa Order ID:</span>
                  <span className="text-white font-mono">{mpesaOrderId}</span>
                </div>

                {transactionHash && (
                  <div className="pt-3 border-t border-green-500/20">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Transaction Hash:</span>
                      <a 
                        href={`https://polygonscan.com/tx/${transactionHash}`}
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

              <div className="mt-4 p-3 bg-green-500/5 rounded-lg">
                <p className="text-sm text-green-300 text-center">
                  Your tokens have been successfully staked. Thank you for participating!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pay Button */}
        {paymentStatus !== 'pending_mpesa' && !pollingInterval && (
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

        {/* Success Message for USDT */}
        {paymentStatus === 'success' && paymentMethod === 'usdt' && transactionHash && (
          <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Check className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-green-300">Staking Successful!</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Amount Staked:</span>
                <span className="text-white font-medium">1 USDT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Transaction Hash:</span>
                <a 
                  href={`https://polygonscan.com/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 font-mono text-xs truncate max-w-[200px]"
                >
                  {transactionHash}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal; 