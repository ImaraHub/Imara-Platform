export const verifyCVWithAI = async (cvText, role) => {
  try {
    const prompt = `Analyze this CV and determine if the candidate is qualified for the role of ${role}. 
    Focus on relevant experience, skills, and technologies.
    
    CV Content:
    ${cvText}
    
    For ${role}, look for:
    ${getRoleSpecificCriteria(role)}
    
    Provide a response in this JSON format:
    {
      "qualified": true/false,
      "reason": "detailed explanation",
      "found_technologies": ["list", "of", "found", "technologies"],
      "missing_technologies": ["list", "of", "missing", "technologies"]
    }`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a technical recruiter analyzing CVs for specific roles. Be thorough but fair in your assessment."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      throw new Error(`xAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('AI Verification Error:', error);
    throw error;
  }
};

const getRoleSpecificCriteria = (role) => {
  switch (role) {
    case 'Frontend Developer':
      return `
      - Frontend frameworks (React, Vue, Angular, Svelte)
      - Modern frontend tools (Next.js, Gatsby, Nuxt)
      - Core web technologies (HTML, CSS, JavaScript)
      - UI/UX principles
      - Responsive design experience
      - State management experience
      - Build tools and package managers`;

    case 'Backend Developer':
      return `
      - Backend frameworks (Node.js, Express, Django, Flask, Ruby on Rails)
      - Database experience (SQL, NoSQL)
      - API design and development
      - Server-side programming
      - Authentication and authorization
      - Performance optimization
      - Cloud services experience`;

    case 'UI/UX Designer':
      return `
      - Design tools (Figma, Adobe XD, Sketch)
      - User research experience
      - Wireframing and prototyping
      - Design systems
      - User testing
      - Visual design skills
      - Portfolio of work`;

    default:
      return 'General technical skills and relevant experience';
  }
};

// Custom API for local model verification
export const verifyCVWithCustomAPI = async (cvFile, role) => {
  const formData = new FormData();
  formData.append('cv', cvFile);
  formData.append('role', role);

  const response = await fetch('http://localhost:8000/verify', {
    method: 'POST',
    body: formData,
  });
  return await response.json();
}; 