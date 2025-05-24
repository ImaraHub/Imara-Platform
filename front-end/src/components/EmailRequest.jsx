import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import {useAddress} from "@thirdweb-dev/react";
import  {AddUser} from "../utils/sessionGenerate";

const RequestEmail = ({ onClose, onSubmit, errorMsg }) => {
  const [email, setEmail] = useState("");
   const address = useAddress();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      console.error("Email is required.");
      return;
    }

    // Call the provided onSubmit function, passing the email
    // if (onSubmit) {
    //   await onSubmit(email);

    // //   add user to db(using email and wallet function addUser(email,wallet))
    // //  this returns { user: user.user, wallet: walletData };
    // //  log out the user and wallet
    // }

    try {
        const { user, wallet } = await AddUser(email, address);
        console.log("User added successfully:", user);
        console.log("Wallet linked successfully:", wallet);
    } catch (addUserError) {
      console.error("Error in addUser:", addUserError.message);
      throw addUserError; // Re-throw if necessary to handle higher up
    }
    // Close the dialog after successful submission
    onClose();
  };

    



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Modal Content */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full space-y-6">
        {/* Error Message */}
        {errorMsg && (
          <div className="text-red-500 mb-4 bg-red-100 p-2 rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {email === "" ? "Submit" : "Submitted"}
            
          </button>
        </form>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-400 hover:underline focus:outline-none"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RequestEmail;
