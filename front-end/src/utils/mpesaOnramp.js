import axios from 'axios';

const API_URL = 'http://localhost:8000/';


export const userAddress = "0x42772299247aDd126151ADe909e36A8f4975437e";  // for testing deposit into wallet(swypt )
// Helper function to get auth headers

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
      phoneNumber: formattedPhone,
      amount: amount
    };

    const response = await axios.post(
      `${API_URL}api/mpesa/initiate`,
      JSON.stringify(requestPayload)
    );

    if (response.data.success) {
      return {
        success: true,
        orderID: response.data.orderID,
        message: response.data.message
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
    const response = await axios.get(
      `${API_URL}api/mpesa/status/${orderID}`
    );

    if (response.data.success) {
      return {
        success: true,
        status: response.data.status.status, // 'SUCCESS', 'FAILED', or 'PENDING'
        message: response.data.status.message,
        details: response.data.status.details
      };
    } else {
      throw new Error(response.data.message || 'Failed to check payment status');
    }
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to check payment status'
    );
  }
};

// 3. Process Crypto Transfer
export const processCryptoTransfer = async (orderID) => {
  try {
    // First get the order details to know the amount
    const orderStatus = await checkOnrampStatus(orderID);
    if (!orderStatus.success) {
      throw new Error('Failed to get order details');
    }

    // Call the backend endpoint instead of Swypt API directly
    const response = await axios.post(
      `${API_URL}api/swypt/crypto-transfer`,
      {
        orderID
      }
    );

    if (response.data.success) {
      return {
        success: true,
        hash: response.data.hash,
        message: response.data.message,
        status: response.data.status || 'success'
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


export async function fetchKesEquivalent({ amount, cryptoCurrency, network, category }) {


  const response = await fetch(`${API_URL}api/swypt/offramp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      fiatCurrency: 'KES',
      cryptoCurrency,
      network,
      category,
    }),
  });

  console.log(response);
  if (!response.ok) throw new Error('Failed to fetch KES equivalent');
  return response.json();
}