import axios from 'axios';

const SWYPT_API_URL = 'https://pool.swypt.io/api';
const USDT_TOKEN_ADDRESS = '0x05D032ac25d322df992303dCa074EE7392C117b9';
export const stakeContractAddress = "";  // to launch on mainnet???
export const userAddress = "0x42772299247aDd126151ADe909e36A8f4975437e";  // for testing deposit into wallet(swypt )
// Helper function to get auth headers

const SWYPT_API_KEY = import.meta.env.VITE_REACT_APP_SWYPT_API_KEY;
const SWYPT_API_SECRET = import.meta.env.VITE_REACT_APP_SWYPT_API_SECRET;

const getAuthHeaders = () => ({
  'x-api-key': SWYPT_API_KEY,
  'x-api-secret': SWYPT_API_SECRET
});

console.log('API Key exists:', !!SWYPT_API_KEY);
console.log('API Secret exists:', !!SWYPT_API_SECRET);

/**
 * Initiates an M-Pesa STK push to the user's phone number.
 * The STK push will be sent to the provided phone number (partyA),
 * and upon successful payment, the USDT will be sent to the contract address.
 * 
 * @param {string} phoneNumber - The user's M-Pesa registered phone number
 * @param {number} amount - The amount in KES to be paid
 * @returns {Promise<{success: boolean, orderID: string, message: string}>}
 */
export const initiateMpesaPayment = async (phoneNumber, amount) => {
  try {
    // Format phone number to ensure it starts with 254 (e.g., 0712345678 -> 254712345678)
    const formattedPhone = phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber.replace(/^0+/, '')}`;
    
    const requestPayload = {
      partyA: formattedPhone,
      amount: amount.toString(),
      side: 'onramp',
      userAddress: userAddress,
      tokenAddress: USDT_TOKEN_ADDRESS
    };

    console.log('Making request to:', `${SWYPT_API_URL}/swypt-onramp`);
    console.log('Request payload:', requestPayload);
    console.log('Request headers:', getAuthHeaders());
    
    // Initiate STK push to user's phone number
    const response = await axios.post(`${SWYPT_API_URL}/swypt-onramp`, requestPayload, {
      headers: getAuthHeaders()
    });

    if (response.data.status === 'success') {
      return {
        success: true,
        orderID: response.data.data.orderID,
        message: response.data.data.message
      };
    } else {
      throw new Error(response.data.message || 'Failed to initiate M-Pesa payment');
    }
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to initiate M-Pesa payment'
    );
  }
};

// 2. Check Onramp Status
export const checkOnrampStatus = async (orderID) => {
  try {
    const response = await axios.get(`${SWYPT_API_URL}/order-onramp-status/${orderID}`, {
      headers: getAuthHeaders()
    });

    console.log(response.data);
    if (response.data.status === 'success') {
      return {
        success: true,
        status: response.data.data.status, // 'SUCCESS', 'FAILED', or 'PENDING'
        message: response.data.data.message,
        details: response.data.data.details
      };
      
    } else {
      throw new Error(response.data.message || 'Failed to check payment status');
    }
  } catch (error) {
    console.error('Status check error:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to check payment status'
    );
  }
};

// 3. Process Crypto Transfer
export const processCryptoTransfer = async (orderID, userAddress) => {
  try {
    // First get the order details to know the amount
    const orderStatus = await checkOnrampStatus(orderID);
    if (!orderStatus.success) {
      throw new Error('Failed to get order details');
    }

    console.log('Processing crypto transfer:', { orderID, userAddress });

    const response = await axios.post(`${SWYPT_API_URL}/swypt-deposit`, {
      chain: 'lisk',
      address: userAddress,
      orderID: orderID,
      project: 'onramp'
    }, {
      headers: getAuthHeaders()
    });

    console.log('Crypto transfer response:', response.data);

    if (response.data.status === 200) {
      return {
        success: true,
        hash: response.data.hash,
        message: response.data.message,
        status: 'success'
      };
    } else {
      throw new Error(response.data.message || 'Failed to process crypto transfer');
    }
  } catch (error) {
    console.error('Crypto transfer error:', error);
    if (error.response?.data) {
      console.error('API Error details:', error.response.data);
    }
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to process crypto transfer'
    );
  }
};

// Poll status until completion or failure
export const pollPaymentStatus = async (orderID, userAddress, maxAttempts = 30, interval = 2000) => {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const status = await checkOnrampStatus(orderID);
      
      if (status.status === 'SUCCESS') {
        // Process crypto transfer after successful payment
        const transferResult = await processCryptoTransfer(orderID, userAddress);
        return { 
          success: true, 
          status: {
            ...status,
            cryptoTransfer: {
              status: transferResult.status,
              message: transferResult.message,
              hash: transferResult.hash,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }, 
          message: 'Payment and crypto transfer completed successfully' 
        };
      } else if (status.status === 'FAILED'  ) {
        return { 
          success: false, 
          status, 
          message: status.message || 'Payment failed' 
        };
      } else if (status.status === 'CANCELLED'  ) {
        return { 
          success: false, 
          status, 
          message: 'User cancelled the payment' 
        };
      }
      
      // If still pending, wait and try again
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    } catch (error) {
      throw error;
    }
  }
  
  throw new Error('Payment status check timed out');
}; 
