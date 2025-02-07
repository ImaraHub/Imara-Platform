import React, { useState } from 'react';

// import tokenisation page from tokenisation.jsx
import Tokenisation from './token';

const Ideation = ({ onIdeaSubmitted }) => {
  const [currentPage, setSecondPage] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    problemStatement: "",
    solutionOverview: "",
    potentialImpact: "",
    tags: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTagChange = (e) => {
    const tagsArray = e.target.value.split(",").map(tag => tag.trim());
    setFormData({ ...formData, tags: tagsArray });
  };

  if (currentPage === 2) {
    return <Tokenisation />;
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      alert("Idea submitted successfully!");
      // setpage to 2
      setSecondPage(2);

      if (onIdeaSubmitted) {

        // pass form data to tokensation page
        onIdeaSubmitted(formData);
      }
    } catch (error) {
      alert("Error submitting idea");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Idea Submission Form</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          Title:
          <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 border rounded-md"/>
        </label>
        <label className="block mb-2">
          Problem Statement:
          <textarea name="problemStatement" value={formData.problemStatement} onChange={handleChange} required className="w-full p-2 border rounded-md"/>
        </label>
        <label className="block mb-2">
          Solution Overview:
          <textarea name="solutionOverview" value={formData.solutionOverview} onChange={handleChange} required className="w-full p-2 border rounded-md"/>
        </label>
        <label className="block mb-2">
          Potential Impact:
          <textarea name="potentialImpact" value={formData.potentialImpact} onChange={handleChange} required className="w-full p-2 border rounded-md"/>
        </label>
        <label className="block mb-2">
          Tags (comma-separated, e.g., DeFi, DePIN):
          <input type="text" name="tags" value={formData.tags.join(", ")} onChange={handleTagChange} required className="w-full p-2 border rounded-md"/>
        </label>
        <button type="submit">Submit Idea</button>
      </form>
    </div>
  );
};

export default Ideation;
