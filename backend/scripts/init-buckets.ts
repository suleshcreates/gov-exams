
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Also try backend .env if root one is missing or doesn't have the keys
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BUCKETS = [
    { name: 'pyq-pdfs', public: true },
    { name: 'topic-pdfs', public: true },
    { name: 'topic-videos', public: true },
    { name: 'special-exam-thumbnails', public: true }
];

async function initBuckets() {
    console.log('Initializing Storage Buckets...');

    for (const bucket of BUCKETS) {
        console.log(`Checking bucket: ${bucket.name}...`);

        const { data, error } = await supabase.storage.getBucket(bucket.name);

        if (error && error.message.includes('not found')) {
            console.log(`Bucket ${bucket.name} not found. Creating...`);
            const { error: createError } = await supabase.storage.createBucket(bucket.name, {
                public: bucket.public,
                fileSizeLimit: 524288000 // 500MB
            });

            if (createError) {
                console.error(`Failed to create bucket ${bucket.name}:`, createError.message);
            } else {
                console.log(`✅ Bucket ${bucket.name} created successfully.`);
            }
        } else if (error) {
            console.error(`Error checking bucket ${bucket.name}:`, error.message);
        } else {
            console.log(`✅ Bucket ${bucket.name} already exists.`);

            // Ensure public
            if (bucket.public !== data.public) {
                console.log(`Updating ${bucket.name} to public...`);
                await supabase.storage.updateBucket(bucket.name, { public: true });
            }
        }
    }
}

initBuckets().catch(console.error);
