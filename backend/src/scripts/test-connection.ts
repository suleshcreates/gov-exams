import dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';
import { supabaseAdmin } from '../config/supabase';

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('Testing Connectivity with node-fetch...');

// Test 1: Simple Ping to valid URL using node-fetch
async function testGoogle() {
    try {
        console.log('Pinging google.com with node-fetch...');
        const res = await fetch('https://www.google.com');
        console.log('Google Ping:', res.status);
    } catch (e) {
        console.error('Google Ping Failed:', e);
    }
}

// Test 2: Supabase Connection using configured client
async function testSupabase() {
    try {
        console.log('Querying Supabase via Admin Client...');
        const { data, error } = await supabaseAdmin.from('students').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Supabase Connection Successful! Count data:', data);
        }
    } catch (e) {
        console.error('Supabase Exception:', e);
    }
}

(async () => {
    await testGoogle();
    await testSupabase();
})();
