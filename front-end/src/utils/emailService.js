import emailjs from '@emailjs/browser';

/**
 * Sends a staking confirmation email to the user
 * @param {Object} params - The parameters for the email
 * @param {string} params.userEmail - The user's email address
 * @param {Object} params.project - The project details
 * @param {Object} params.paymentDetails - The payment/staking details
 * @returns {Promise<boolean>} - Whether the email was sent successfully
 */
export const sendStakingConfirmationEmail = async ({ userEmail, project, paymentDetails }) => {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  try {
    // Prepare email template parameters
    const templateParams = {
      to_email: userEmail,
      from_name: "Imarahub Team",
      from_email: "no-reply@imarahub.com",
      project_title: project.title,
      project_id: project.id,
      amount: paymentDetails.amount,
      token: paymentDetails.token,
      transaction_hash: paymentDetails.transactionHash,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      project_url: `${VITE_APP_BASE_URL}/idea/${project.id}`
    };

    // Send email using EmailJS
    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    if (response.status === 200) {
      console.log('Email sent successfully');
      return true;
    } else {
      console.error('Failed to send email:', response);
      return false;
    }
  } catch (error) {
    console.error('Error in sendStakingConfirmationEmail:', error);
    return false;
  }
}; 