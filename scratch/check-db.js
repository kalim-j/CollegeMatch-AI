const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple parser for .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const val = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
    process.env[key.trim()] = val;
  }
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkColleges() {
  console.log('Querying first 3 colleges...');
  const { data, error } = await supabase.from('colleges').select('*').limit(3);
  if (error) {
    console.error('Error fetching colleges:', error);
    return;
  }
  console.log('Sample Colleges:', JSON.stringify(data, null, 2));

  console.log('\nQuerying colleges where latitude is not null...');
  const { data: geoData, error: geoError } = await supabase
    .from('colleges')
    .select('id, name, latitude, longitude')
    .not('latitude', 'is', null)
    .limit(3);

  if (geoError) {
    console.error('Error fetching geo colleges:', geoError);
    return;
  }
  console.log('Sample Geo Colleges:', JSON.stringify(geoData, null, 2));
}

checkColleges();
