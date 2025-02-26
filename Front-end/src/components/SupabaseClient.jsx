import { createClient } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
// import { useAuth } from "../AuthContext";

const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabase = createClient(supabaseUrl, supabaseKey);


export const addIdea = async (formData, user) => {

    try {
    
        // Insert idea along with the authenticated user's UID
        const { title, details, link, license, image } = formData;

        // Insert Data into Database
        const { data, error } = await supabase.
        from('ideas')
        .insert([{title, details, link, license, image, uid: user.id}]);
    
        if (error) {
          console.error("Insert error:", error);
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

export const displayIdeas = () => {

    const[data, setData] = useState([]);
    

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase.from('ideas').select('*');
            setData(data);
        }
        fetchData();

        console.log(data);
    }, []);

}


