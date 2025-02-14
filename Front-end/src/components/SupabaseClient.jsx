import { createClient } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';


const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabase = createClient(supabaseUrl, supabaseKey);

const DisplayIdeas = (data) => {

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

const AddItem = async (title, details, link, license, image) => {

    const { data, error } = await supabase.from('ideas').insert([title, details, link, license, image]);

    if (error) {
        console.log(error);
    } else {
        console.log(data);
        console.log('Data inserted successfully');
    }

}

export default SupabaseClient;

