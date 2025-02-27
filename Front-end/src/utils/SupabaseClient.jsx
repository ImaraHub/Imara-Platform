import { createClient } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
// import { useAuth } from "../AuthContext";

const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabase = createClient(supabaseUrl, supabaseKey);


export const addIdea = async (formData, user) => {

    try {
    
        // Insert idea along with the authenticated user's UID
        const { title, details, link, license,image, resources, timeline } = formData;
        const needsprojectmanager = formData.needsProjectManager; 

        // Ensure resources is formatted correctly
        const formattedResources = resources ? JSON.stringify(resources) : null;

        // Insert Data into Database
        const { data, error } = await supabase.
        from('ideas')
        .insert([{
            title, 
            details, 
            link, 
            license, 
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

export const uploadImageToSupabase = async (image, user) => {
    // const user = supabase.auth.getUser(); // Check if user is authenticated
    // console.log("Uploading Image:", image);
    console.log("Current user in uploadImage:", user);

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


