import {createClient} from '@supabase/supabase-js';
export const supabaseUrl=import.meta.env.VITE_SUPABASE_URL || 'https://daccbvawayvyrngpuvsw.supabase.co';
export const supabase=createClient(supabaseUrl,import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_PxXvvgkVnuFJyjhG2cvtgg_PI7q_5eG',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:!window.cordova}});
