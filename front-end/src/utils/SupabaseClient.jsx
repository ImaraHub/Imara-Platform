import { createClient } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
// import { useAuth } from "../AuthContext";

const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabase = createClient(supabaseUrl, supabaseKey);

// console.log('Supabase URL:', supabaseUrl);
// console.log('Supabase Key:', supabaseKey);


export const addIdea = async (formData, user) => {

    try {
    
        // Insert idea along with the authenticated user's UID
        const { title, solution, projectDescription, problemStatement,image, resources, timeline } = formData;
        const needsprojectmanager = formData.needsProjectManager; 

        // Ensure resources is formatted correctly
        const formattedResources = resources ? JSON.stringify(resources) : null;

        // Insert Data into Database
        const { data, error } = await supabase.
        from('ideas')
        .insert([{
            title, 
            problemStatement, 
            projectDescription, 
            solution,
            image,
            resources : formattedResources,
            needsprojectmanager,
            timeline, 
            uid: user.id}]);
    
        if (error) {
          console.error("Insert error:", error.message, error.details, error.hint);
          return null;
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

    console.log("Public URL Response:", publicUrlData);

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

    console.log("Public URL Response:", publicUrlData);
   

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
        console.log("User in addUserData:", user);

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
        console.log("User in getUserData:", user);
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

        console.log("Updating user:", user.id, "with data:", formData);  

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
            return error.message;
        }

        console.log("User data updated successfully!");
        return true; // Success
    } catch (err) {
        console.error("Unexpected error:", err);
        return err.message;
    }
};
  
// function to update contributors for a project
export const addProjectContributors = async (project, user, role) => {
    try {
        if (!project || !project.id) {
            console.error("Project ID is missing!");
            return "Project ID is required";
        }   

        // add to supabase db
        const { data, error } = await supabase
            .from('idea_contributors')
            .insert([
                {
                    idea_id: project.id,
                    user_id: user.id,
                    role
                }
            ]);
        } catch (err) {
            console.error("Unexpected error:", err);
            return null;
        }
    }   