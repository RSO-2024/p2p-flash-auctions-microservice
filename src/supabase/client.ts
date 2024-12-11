import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
);

export default supabase;