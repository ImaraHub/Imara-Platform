import { createClient } from '@supabase/supabase-js';
import { useAuth } from "../AuthContext";

const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: true,
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'imara-auth-token',
    storage: {
      getItem: (key) => {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      },
      setItem: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
      },
      removeItem: (key) => {
        localStorage.removeItem(key);
      },
    },
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
});

// console.log('Supabase URL:', supabaseUrl);
// console.log('Supabase Key:', supabaseKey);


export const addIdea = async (formData, user) => {
    try {
        // Insert idea along with the authenticated user's UID
        const { title, solution, projectDescription, problemStatement, image, resources, timeline } = formData;
        const needsprojectmanager = formData.needsProjectManager; 

        // Ensure resources is formatted correctly
        const formattedResources = resources ? JSON.stringify(resources) : null;

        // Insert Data into Database
        const { data, error } = await supabase
            .from('ideas')
            .insert([{
                title, 
                problemStatement, 
                projectDescription, 
                solution,
                image,
                resources: formattedResources,
                needsprojectmanager,
                timeline, 
                uid: user.id
            }])
            .select()
            .single();
    
        if (error) {
            console.error("Insert error:", error.message, error.details, error.hint);
            return null;
        }

        // Create initial chat message
        if (data) {
            await createInitialChatMessage(data.id, {
                ...data,
                uid: user.id
            });
        }
    
        return data;
    } catch (err) {
        console.error("Unexpected error:", err);
        return null;
    }
}


export const uploadCvToSupabase = async (cv, user) => {

    const fileExt = cv.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload CV
    const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('usercvs')
    .upload(filePath, cv);

    if (uploadError) {
        console.error("Error uploading CV:", uploadError);
        return null;
    }

    // Fetch public URL correctly
    const { data: publicUrlData, error: urlError } = supabase
        .storage
        .from('usercvs')
        .getPublicUrl(filePath);

    if (urlError) {
        console.error("Error retrieving CV URL:", urlError);
        return null;
    }

    // console.log("Public URL Response:", publicUrlData);

    return publicUrlData.publicUrl;

}


export const uploadImageToSupabase = async (image, user) => {
    // const user = supabase.auth.getUser(); // Check if user is authenticated
    // console.log("Uploading Image:", image);
    // console.log("Current user in uploadImage:", user);

    // upload image to storage

    const fileExt = image.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload image
    const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('ideaImages')
    .upload(filePath, image);

    if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return null;
    }

    // Fetch public URL correctly
    const { data: publicUrlData, error: urlError } = supabase
        .storage
        .from('ideaImages')
        .getPublicUrl(filePath);

    if (urlError) {
        console.error("Error retrieving image URL:", urlError);
        return null;
    }

    // console.log("Public URL Response:", publicUrlData);
   

    return publicUrlData.publicUrl;

}

export const displayIdeas = async () => {
    try {
        const { data, error } = await supabase.from('ideas').select('*');
        if (error) {
            console.error("Error fetching ideas:", error);
            return [];
        }
        return data; // Return the fetched ideas
    } catch (err) {
        console.error("Unexpected error:", err);
        return [];
    }
};


// add a function that updates db with user data, the foreign key is the user id

export const addUserData = async (formData, user, address) => {
    try {
        // Insert idea along with the authenticated user's UID

        // retrieve user auth id
        // console.log("User in addUserData:", user);

        const { github, linkedin, twitter, portfolio,cv } = formData;
        const { data, error } = await supabase
        .from('users')
        .insert([
            {
                auth_id: user.id,
                linkedin_profile: linkedin,
                github,
                email: user.email,
                twitter_handle:twitter,
                portfolio_link:portfolio,
                wallet_address:address,
                cv_link:cv
            }
        ]);
        if (error) {
            console.error("Error inserting user data:", error);
            return null;
        }
        return data;
    }
    catch (err) {
        console.error("Unexpected error:", err);
        return null;
    }
}


//  retrieve details from db for user based on their user.id (auth_id) or user.email
export const getUserData = async (user) => {
    try {
        // console.log("User in getUserData:", user);
        // Retrieve user data from the database
        const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id);
        if (error) {
            console.error("Error fetching user data:", error);
            return null;
        }
        return data;
    }
    catch (err) {
        console.error("Unexpected error:", err);
        return null;
    }
}

export const updateUser = async (user, formData, address) => {
    try {  
        if (!user || !user.id) {
            console.error("User ID is missing!");
            return "User ID is required";
        }

        const { github, linkedin, twitter, portfolio, cv } = formData;

        // console.log("Updating user:", user.id, "with data:", formData);  

        // Construct updated data object
        const updatedData = {
            linkedin_profile: linkedin || null,
            github: github || null,
            email: user.email,  // Ensure email is not undefined
            twitter_handle: twitter || null,
            portfolio_link: portfolio || null,
            wallet_address: address || null,  // FIXED: Now properly passed
            cv_link: cv || null,
        };

        const { error } = await supabase
            .from('users')
            .update(updatedData)
            .eq('auth_id', user.id);

        if (error) {
            console.error("Error updating user data:", error);
            return null;
        }
        
        // Fetch the updated user data after successful update
        const updatedUserData = await getUserData(user);

        return updatedUserData;

    } catch (err) {
        console.error("Unexpected error in updateUser:", err);
        return null;
    }
}

export const addProjectContributor = async (project, user, role) => {
    try {
        if (!project || !project.id) {
          console.error("Project ID is missing!");
          return "Project ID is required";
         }   
        const { data, error } = await supabase
            .from('idea_contributors')
            .insert([
                {
                    idea_id: project.id,
                    user_id: user.id,
                    role: role,
                    approved_status: 'pending',
                    stake_status:"staked"
                },
            ]);

        if (error) {
            console.error("Error adding project contributor:", error);
            return null;
        }

        return data;
    } catch (err) {
        console.error("Unexpected error in addProjectContributor:", err);
        return null;
    }
};




    //  retrieve project contributors from db based on project id and user.id
    export const getProjectContributors = async (project, user) => {
      try {
          if (!project || !project.id) {
              console.error("Project ID is missing!");
              return "Project ID is required";
          }
          if (!user || !user.id) {
              console.error("User ID is missing!");
              return "User ID is required";
          }
          // Retrieve project contributors from the database      
          const { data, error } = await supabase
          .from('idea_contributors')
          .select('*')
          .eq('idea_id', project.id)
          .eq('user_id', user.id);
          if (error) {
              console.error("Error fetching project contributors:", error);
              return null;
          }
          return data;
      }

      catch (err) {
          console.error("Unexpected error:", err);
          return null;
      }
  }   

export const retrieveJoinedProjects = async (user) => {
    try {
        // First get the contributor records for the user
        const { data: contributorData, error: contributorError } = await supabase
            .from('idea_contributors')
            .select(`
                *,
                ideas:idea_id (
                    id,
                    title,
                    projectDescription,
                    image,
                    categories,
                    created_at,
                    uid
                )
            `)
            .eq('user_id', user.id)
            .eq('approved_status', 'pending');

        if (contributorError) {
            console.error("Error fetching joined projects:", contributorError);
            return null;
        }

        // Transform the data to include both contributor and idea information
        const joinedProjects = contributorData.map(contributor => ({
            ...contributor.ideas,
            role: contributor.role,
            joinedDate: contributor.created_at,
            stake_status: contributor.stake_status,
            approved_status: contributor.approved_status
        }));

        return joinedProjects;
    } catch (err) {
        console.error("Unexpected error in retrieveJoinedProjects:", err);
        return null;
    }
}
  export const retrieveCreatedProjects = async (user) => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('uid', user.id);
  
      if (error) {
        console.error("Error fetching created projects:", error);
        return [];
      }
  
      return data;
    } catch (err) {
      console.error("Unexpected error in retrieveCreatedProjects:", err);
      return [];
    }
  };

  export const fetchProjectById = async (projectId) => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', projectId)
        .single();
  
      if (error) {
        console.error("Error fetching project by ID:", error);
        return null;
      }
  
      return data;
    } catch (err) {
      console.error("Unexpected error in fetchProjectById:", err);
      return null;
    }
  };

  export const getAllProjectContributors = async (projectId) => {
    try {
        if (!projectId) {
            console.error("Project ID is missing!");
            return null;
        }

        const { data, error } = await supabase
            .from('idea_contributors_with_user')
            .select('*')
            .eq('idea_id', projectId);

        if (error) {
            console.error("Error fetching enriched contributors:", error);
            return null;
        }

        // Transform the data to match the expected structure
        const transformedData = data.map(contributor => ({
            ...contributor,
            user: {
                email: contributor.email || 'No email provided',
                display_name: contributor.display_name || contributor.email || 'Anonymous User'
            }
        }));

        return transformedData;
    } catch (err) {
        console.error("Unexpected error in getAllProjectContributors:", err);
        return null;
    }
}

export const isRoleAvailable = async (projectId, role) => {
    try {
        // Get the project's resources
        const { data: projectData, error: projectError } = await supabase
            .from('ideas')
            .select('resources')
            .eq('id', projectId)
            .single();

        if (projectError) {
            console.error("Error fetching project resources:", projectError);
            return false;
        }

        // Parse resources if it's a string
        const resources = typeof projectData.resources === 'string' 
            ? JSON.parse(projectData.resources) 
            : projectData.resources;

        // Find the required count for this role
        const requiredRole = resources.find(r => r.role === role);
        if (!requiredRole) return false;

        // Get current count of contributors for this role
        const { data: contributors, error: contributorsError } = await supabase
            .from('idea_contributors')
            .select('*')
            .eq('idea_id', projectId)
            .eq('role', role)
            .eq('approved_status', 'approved'); // Check for approved contributors

        if (contributorsError) {
            console.error("Error fetching contributors:", contributorsError);
            return false;
        }

        // Check if we've reached the required count
        return contributors.length < requiredRole.count;
    } catch (err) {
        console.error("Unexpected error in isRoleAvailable:", err);
        return false;
    }
};
// Backend API Base URL (Replace with your deployed backend URL in production)
const BACKEND_API_BASE_URL = 'http://localhost:8080/api';
// Chat related functions
export const createChatMessage = async (projectId, userId, message, userData) => {
  try {
    const response = await fetch(`${BACKEND_API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary authorization headers here, e.g., bearer token
        // 'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`
      },
      body: JSON.stringify({
        project_id: projectId,
        user_id: userId,
        message: message,
        username: userData.username || 'Anonymous',
        email: userData.email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error creating chat message on backend:", response.status, errorData);
      // You might want to throw an error or return null/error object
      throw new Error('Failed to send message');
    }

    const result = await response.json();
    console.log("Message sent successfully via backend:", result);
    return result; // Or whatever the backend returns

  } catch (err) {
    console.error("Unexpected error in createChatMessage (backend call):", err);
    throw err; // Re-throw the error to be caught by the caller (e.g., ProjectWorkspace)
  }
};

export const getChatMessages = async (projectId) => {
  // This still fetches initial messages directly from Supabase.
  // If you want to move fetching to the backend as well, you'd create a new endpoint.
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching chat messages:", error);
      return [];
    }

    return data;
  } catch (err) {
    console.error("Unexpected error in getChatMessages:", err);
    return [];
  }
};

export const createInitialChatMessage = async (projectId, projectData) => {
  // This can also be moved to the backend if you prefer to centralize project creation logic
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          project_id: projectId,
          user_id: projectData.uid,
          message: `Welcome to the ${projectData.title} project! This is the beginning of our collaboration. Let's work together to make this project a success.`,
          username: 'System',
          email: 'system@imara.com',
          is_system_message: true
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating initial chat message:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Unexpected error in createInitialChatMessage:", err);
    return null;
  }
};
