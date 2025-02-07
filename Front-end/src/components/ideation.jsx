import React, { useState } from 'react';
import createToken from '../utils/config';
import {useAddress} from "@thirdweb-dev/react";

const Ideation = ({ onSubmit }) => {
    const address = useAddress();
    const [formData, setFormData] = useState({
      name: "",
      symbol: "",
      initialSupply: "",
      logoUrl: ""
    });
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();

        // call creationToken function
        // print  form data
        console.log("Form data:", formData);

        try {
            const tokenAddress = await createToken({
              name: formData.name,
              symbol: formData.symbol,
              initialSupply: Number(formData.initialSupply),
              logUrl: formData.logoUrl,
              address
            });

            if (tokenAddress) {
              alert(`Token created successfully! Contract Address: ${tokenAddress}`);
          } else {
              alert("Token creation failed.");
          }

            alert("Token created successfully");
        } catch (error) {
            alert("Error creating token");
            console.log("Error creating token:", error);
        }

      if (onSubmit) {
        onSubmit(formData);
      }
    };
  
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Create a New Token</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </label>
  
          <label className="block mb-2">
            Symbol:
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </label>
  
          <label className="block mb-2">
            Initial Supply:
            <input
              type="number"
              name="initialSupply"
              value={formData.initialSupply}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </label>
  
          <label className="block mb-2">
            Logo URL:
            <input
              type="text"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </label>
  
          <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
            Submit
          </button>
        </form>
      </div>
    );
  };
  
  export default Ideation;