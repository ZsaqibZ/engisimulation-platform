require('dotenv').config({ path: '.env.local' });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

fetch(`${url}/storage/v1/bucket`, {
    headers: {
        'Authorization': `Bearer ${key}`,
        'apikey': key
    }
})
    .then(res => res.json())
    .then(console.log)
    .catch(console.error);
